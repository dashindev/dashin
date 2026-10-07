# Dashin 严格变异契约 (Strict Mutation Contract) 实施方案

> **背景与依据**：基于 `C:\Users\Chris\Projects\studio-strategy\handoffs\dashin-strict-mutation-contract.md`
> **核心目标**：彻底修复 Dashin 核心请求层、Payload 数据源适配器以及 `DetailDrawer` 中“CRUD 失败被当作成功处理”的跨包契约漏洞，确保任何变异失败均严格 reject、保留抽屉、展示业务错误原因并不触发成功提示。

---

## 一、 根因分析与架构修复

### 1. 核心请求层 (`packages/dashin/src/utils/scripts/request.ts`)
- **现状**：`errorHandler` 对非 2xx 响应直接返回 `{ error: errorText }`，导致原本应当 rejected 的 Promise 被 `umi-request` 判定为 resolved。调用方通过 `await request(...)` 拿到的是一个普通对象，无法通过 `try...catch` 捕获异常。
- **修复**：
  - `errorHandler` 规范化错误对象（包含 `status`, `url`, `data`, `message`, `description`），并显式 `throw` 或 `return Promise.reject(normalizedError)`。
  - 增加中间件，检查 HTTP 200 下包含 `errors` 数组、`success: false` 或 `ok: false` 的业务异常并拒绝。
  - 提供可选的 `legacyResolveError?: boolean` 配置以防特殊场景，但默认必须是严格 rejection。

### 2. Payload 数据源适配器 (`packages/dashin-source-payload`)
- **现状**：
  - `services/crud.ts`（`addSer`, `updateSer`, `deleteSer`）：无条件 `await notice(...)` 发送成功通知，只要 `res.errors` 不存在就视为成功，且无论成功失败均返回 `res`，从不 reject。
  - `services/bulk.ts`：以 `res && res.errors ? fail++ : ok++` 统计，无法感知被 resolve 的 `{ error }` 或真正的网络 reject。
  - `services/errors.ts`：对复杂嵌套错误的解析需确保覆盖 `errors[0].data.errors[0].message`。
- **修复**：
  - `crud.ts` 在严格判断成功后才发送成功 notice；若捕获到错误或响应中包含 `errors`，提取错误信息并严格 `throw` 拒绝。
  - `bulk.ts` 使用 `try/catch` 逐项执行，准确统计成功与失败项，部分失败时绝不显示全成功通知。

### 3. DetailDrawer 抽屉与状态机 (`packages/dashin/src/components/DetailDrawer/index.tsx`)
- **现状**：
  - `handleDelete` 没有 `catch` 处理，删除失败时无错误横幅且可能触发未捕获异常。
  - 错误横幅缺少无障碍属性 `role="alert"` 和 `aria-live="assertive"`。
  - 修改表单字段时没有即时清除错误信息。
  - 数值类型字段清空时自动转为 `0`，绕过了 `required` 必填检查。
- **修复**：
  - 统一 `handleSave` 与 `handleDelete` 的状态机：只有在 Promise resolve 后才执行 `onClose()` 与 `onSaved()`。
  - 发生 rejection 时保持抽屉打开，展示具有 `role="alert" aria-live="assertive"` 的错误横幅，并解除 `saving` 状态允许重试。
  - 修改字段（`setField`）、切换记录或切换模式时自动重置错误信息（`setErr(null)`）。
  - 支持 `Column` 级别的 `required` 与 `validate(value, row)` 校验；清空数字时保留空值（`""` 或 `null`）。

---

## 二、 任务分解与执行步骤

1. **Step 1**: 编写与更新 `TODO.md`，确立粒度任务。
2. **Step 2**: 改造 `packages/dashin/src/utils/scripts/request.ts` 并新增 `request.test.ts` 覆盖 201 resolve、400/409/422 reject、200+errors reject、断网/超时 reject。
3. **Step 3**: 改造 `packages/dashin-source-payload/services/`（`crud.ts`, `bulk.ts`, `errors.ts`），编写单测覆盖成功/失败 notice 触发次数、bulk 计数与嵌套错误提取。
4. **Step 4**: 改造 `packages/dashin/src/components/DetailDrawer/`，支持必填/validate 校验、数值清空保留空值、删除错误捕获、`role="alert"` 横幅与错误重置。
5. **Step 5**: 检查 `RelatedPreview`、`CrudTable`、`bindings.ts` 与 CLI 模板一致性，编写对应测试。
6. **Step 6**: 运行全 Monorepo 构建、类型检查、测试集与文档构建验证。

---

## 三、2026-09-20 Phase 12 独立复核返工

独立复核发现首轮实现仍有批量操作、请求判别器语义、D1 transport failure、模板冒烟隔离与干净安装/E2E 门禁缺口。本轮在不提交、不发布的前提下完成：

1. **Table 批量状态机**：自定义 action、内置 bulk delete/update 都必须 await；失败展示可访问错误横幅、保留可重试选择，带 `resList` 时仅保留失败项；扩展 `Action.onClick` 异步类型并补齐测试。
2. **Request 精确契约**：固化自定义判别器为 `string/true = 失败`、`false/undefined/null = 无错误`；测试四类返回值；业务错误优先保留真实 `response.url`，精确断言 response 身份与 URL。
3. **D1 批量 transport failure**：delete/update 逐项捕获 execute throw，继续处理剩余项并统一汇总、通知、reject；覆盖成功、部分失败、全失败、transport throw。
4. **模板生产冒烟可靠性**：动态空闲端口、本次构建唯一标记、启动进程早退检测、Windows 进程树清理、端口释放与临时目录删除断言；连续运行两次验证。
5. **依赖与全量门禁**：移除平台绑定的根直接依赖、修复 lockfile/Babel helper；在干净 Node 20 环境执行 frozen install、build、typecheck、相关单测、文档、Playwright E2E、两次 template smoke 与 `git diff --check`。
6. **交付状态**：TODO 与实际结果保持一致，清除测试临时产物，保留未提交/未发布工作树供所有者复核。

---

## 四、Phase 12 文档收尾与提交前准备

1. 统一 Phase 12 历史门禁数字与最终结果，避免首轮数字被误读为最终状态。
2. 新增公开 VitePress“严格变异契约”与 `2.0.0-alpha.8` 迁移说明，并加入现有导航。
3. 审计 `RequestError`、`RequestOptionsInitWithLegacy`、`Action` 异步签名的公共导出链路。
4. 在 Node 20 下重新执行 frozen install、全构建、类型检查、三组完整单测、E2E、文档构建、连续两次 template smoke 与 diff 检查。
5. 审计 GitHub Actions Node 20/Linux 配置；在不推送的前提下使用隔离 Linux 环境验证可重复安装与核心门禁，记录 GitHub CI 未触发原因。
6. 按 fix/test/docs 拆分三个聚焦提交；不推送、不合并、不发布、不升级家赞依赖。

---

## 五、家赞历史改进回馈：全量差异盘点与第二阶段可靠性返工 (2026-10-07)

> **依据**：`studio-strategy/handoffs/dashin-jiazan-generalization-20261007.md`。
> **边界**：只改 Dashin 仓库；不修改家赞；不推送、不发布 npm、不部署。核心只表达通用
> 表格/字段/关系/操作/媒体/认证能力，不写死任何养老业务概念；新行为向后兼容、显式 opt-in。

### 5.1 第一阶段：G01–G12 全历史差异盘点（以 `2.0.0-alpha.8` 当前源码为准）

| 编号 | 能力 | Dashin 上游位置 | 盘点时状态 | 与家赞的差异 / 缺口 | 处置 |
| --- | --- | --- | --- | --- | --- |
| G01 | 详情抽屉与操作入口 | `components/CrudTable`、`components/DetailDrawer` | **已有**（alpha.8 已发布） | 行操作 stopPropagation 不触发预览、抽屉草稿独立、错误横幅/校验齐备；抽屉按钮文案仍为硬编码英文，缺 i18n 与焦点恢复 | Phase 2-D 已补齐 i18n/焦点 |
| G02 | 多账号切换与退出 | `TopBar/UserMenu`（Switch account / Add another / Logout），users 表按 username 索引多账号，logout 仅删除当前账号行并清指针 | **部分** | 已有基础存储/切换/退出语义；家赞 AccountSwitcher 的内联切换器、移除与切换的差异交互未上游 | Phase 3 接口方案 |
| G03 | 权限菜单与路由 | `NestedMenu.isAllowedRole`（按 item.role 过滤） | **部分** | 菜单隐藏 ≠ 路由拒绝；路由层无角色守卫，capability 回调注入缺失 | Phase 3 |
| G04 | 日期编辑器 | `components/ui/DatePicker` | **已有** | YYYY-MM-DD 字符串无时区漂移、i18n 月/星期名、清空/Today；周起始日固定周一不可配、日历网格无键盘导航 | Phase 3 增强 |
| G05 | 鉴权媒体与预览 | `components/ui/ImageEdit`（注入式上传/预览） | **部分** | 缺鉴权 blob 加载（AuthImage）、URL allowlist/同源策略、按身份隔离的缓存与撤销、PDF/原图失败恢复 | Phase 3 |
| G06 | 关联摘要与堆叠编辑 | `components/RelatedPreview`（Provider/RelatedCard/RelatedList、loop guard、depth cap） | **已有**（alpha.8 已发布） | 与家赞 PreviewStack 等价；焦点恢复可补强 | Phase 2-D 已补齐焦点/Escape |
| G07 | 查询竞争与重复请求 | `Table.loadRemote`（Table/index.tsx） | **缺失 → 已实施** | 无版本/卸载守卫：旧响应可覆盖新列表；请求 reject → isLoading 永久悬挂 + unhandled rejection；卸载/路由切换可写回失效页；挂载时双发初始请求。统计已分离（computeStats 独立 + cancelled 标记），不复制家赞 pageSize=1 判别 | **Phase 2-B 已实施** |
| G08 | 长菜单与宽表布局 | `NestedMenu`、`DefaultLayout`、`Table` | **缺失 → 已实施** | max-h-96 截断 >12 项子菜单；aside 无纵向滚动；折叠 flyout 不受视口约束、无键盘焦点；连续展开用过期 open state；菜单项 li 无键盘/aria；表无最小宽度策略（内容被压窄而非滚动）；外层+卡片双滚动容器 | **Phase 2-D 已实施** |
| G09 | 严格失败与表单验证 | `request.ts`、sources、Table/DetailDrawer | **已有**（Phase 12，alpha.8） | 严格 reject 契约、opt-in 业务判别器、抽屉/行内校验、错误横幅 | — |
| G10 | 认证拒绝遗漏 | `plugins/auth-*/sign-in/controllers/submitController.ts` | **缺失 → 已实施**（payload/local/strapi/pocketbase/atomo） | 请求层 strict reject 后 submit 无 catch → unhandled rejection、isSubmitting 悬挂、无用户可读错误；JSON.stringify(res) 直出原始响应；DB put 中途失败 → 半写入身份；strapi /users/me 二次请求同样裸奔；local/strapi/pocketbase 用 router.push("/") 不触发重新认证（payload 注释已记录该坑）；payload/atomo `role \|\| "admin"` 缺角色时默认提权。auth-atomo 有 try/catch 但先写 localStorage 后写库仍可能半写入；auth-sso callback 已闭环 | **Phase 2-A 已实施** |
| G11 | 关系联动与复合编辑 | `Selector`（静态 lookup）、`RelatedCard` | **部分** | 无异步分页搜索关系选择器、父级联动清空、已选项跨页保留、多值时间/明细复合字段编辑器 | Phase 3 |
| G12 | 筛选/批量/水印 | Table 内建筛选行、批量契约 | **部分 → 已实施（局部）** | 内建筛选控件无原生可访问名称；批量已有 resList/retain-failed 契约但文案无结构化计数、换页后选择索引漂移；鉴权媒体导出与水印扩展未上游 | Phase 2-C/D 已实施局部；媒体/水印归 Phase 3 |

核对：历史 PR #143–149 已将 CrudTable/DetailDrawer/RelatedPreview/ImageEdit/DatePicker/严格变异契约带入 alpha.8，家赞 `_shared` 同名组件为其下游防御副本；`payloadRequest` 严格传输层与 alpha.8 strict contract 等价，属业务适配器边界，不重复上游化（家赞侧 opt-in 判别器模式与 Phase 12 `checkBusinessErrors` 对齐）。

### 5.2 第二阶段实施项（可靠性缺口，2026-10-07 已实施）

- **A 认证失败闭环（G10）**：核心新增共享提交助手 `completeSignIn`（`utils/scripts/signIn.ts`）：统一 sign-in 结果校验（`user.username` 必填、可按 `requireToken` 要求 token）、Dexie 事务内原子写入 `users`+`settings`（失败不产生半写入身份）、成功才执行 `afterPersist` 副作用（如插件自管 token 存储）与导航、失败统一可读错误（`signInErrorMessage`：RequestError message/description → `errors`/`message` → 回退 `t("Sign in failed")`，不 `JSON.stringify` 原始响应）、`setSubmitting(false)` finally 保证、默认 `window.location.assign("/")` 全量导航（修复 local/strapi/pocketbase 的 router.push 不重新认证缺陷，可被 `navigate` 覆盖）。五个 sign-in + strapi sign-up 控制器统一接入；payload/atomo `role || "admin"` 缺失默认改为 fail-closed `"user"`。
- **B 列表查询生命周期（G07）**：Table 增加查询序号守卫 + AbortController（`Query.signal` 可选透传给适配器）+ `mountedRef` 卸载守卫；旧成功/旧失败均不写回；最新失败 → 可访问错误横幅并复位 loading；查询/翻页/筛选触发新一轮；远程或本地数据重算时清空页相对失效选择（修复翻页后索引漂移误删）；合并挂载期双重 remote load 为一次。
- **C 批量结构化失败（G12 局部）**：内置 bulkDelete 聚合结构化 i18n 消息（`bulkFailureSummary` 成功/失败计数 + 每项行标识 `id/uuid/_id/页内序号` 与原因），与既有 resList 保留失败项语义一致；不宣称整批事务；`bulkUpdateSer`（D1/Payload）改用 `primaryKey` 支持非标准主键。
- **D 布局与原生可访问性（G08 + G12 局部）**：NestedMenu 函数式展开态、`max-h-96` → `max-h-[60vh] overflow-y-auto`、flyout 视口钳制+滚动+Escape 回焦+`role="menu"`/`menuitem` 键盘操作、菜单项 `role="button"`/`tabIndex`/`aria-current`/`aria-expanded`；DefaultLayout aside `overflow-y-auto` + 内容区单滚动责任（外层唯一纵滚容器，卡片不再限高纵滚）；Table `options.minTableWidth` 表最小宽度 + 列 `width`/`minWidth` 最小列宽、行/全选/筛选值/筛选算子/分页/展开控件 i18n aria 名称（en/zh，de 为 stub 兜底英文）；DetailDrawer 文案 i18n 化 + `role="dialog"`/`aria-modal` + 打开聚焦与关闭焦点恢复；PreviewStack frame `role="dialog"`、逐帧焦点捕获/恢复、仅顶层响应 Escape 且编辑抽屉打开时让位。

### 5.3 验证策略与结果（2026-10-07）

- 认证：`signIn.test.ts` fake db/notify 覆盖成功/拒绝/缺字段/存储失败/重试成功（9 项）；auth-payload 控制器回归（2 项）+ service fail-closed（3 项）；auth-pocketbase（3 项）/auth-atomo（3 项）service 回归。
- Table：可控延迟 Promise 矩阵——挂载仅一次查询、旧慢新快丢弃旧响应、AbortSignal 透传+旧请求 aborted、远程失败横幅+退出 loading、卸载后写回忽略、新结果清空选择（Table 25 项全过）。
- 批量：部分失败结构化文案与失败项保留、全失败、transport throw（Table 25 + D1 27 + Payload 40 项全过）。
- 布局/a11y：Table aria 名称与 minTableWidth 断言、DetailDrawer `role="dialog"`/焦点进出、PreviewStack/NestedMenu 回归（NestedMenu 4 + DetailDrawer 14 + RelatedPreview 5 项全过）；en/zh 文案键齐全，de 沿用 stub 兜底。
- 门禁结果：`yarn tsc:build` 23 包全绿；`yarn workspace @dashin-dev/dashin typecheck` 0 错误；`packages/dashin` 27 文件/195 项单测全过；受影响插件与源包（auth-payload 5 / auth-pocketbase 3 / auth-atomo 3 / source-d1 27 / source-payload 40）全过；`git diff --check` 0 报错（期间发现 TODO/PLAN 曾被写入 CRLF 行尾，已归一为 LF）。
- Playwright E2E：6 passed / 3 skipped / 0 failed（与既有基线一致；3 个 skipped 为需真实后端的 ecommerce 用例）。sign-in 路由与实体表路由在改动后无致命运行时错误。
- 未执行：docs 构建与 template smoke（本轮无模板/docs 构建物变更）；发布、推送、部署均按边界未执行。
