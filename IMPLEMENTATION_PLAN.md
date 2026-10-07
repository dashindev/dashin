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

### 5.1 第一阶段：G01–G12 全历史差异盘点（2026-10-07 独立复核）

发布基线：npm 查询确认 core alpha.8 存在；本地 tag `v2.0.0-alpha.8` 指向 `0aa17ff`，
其 `src/main.ts → components/index.ts` 实际导出 CrudTable/DetailDrawer/RelatedPreview/DatePicker/ImageEdit。
不能由 PR 编号推断组件等价或已发布。当前 4 个本地主题提交及本轮返工均**未发布**。
家赞参考只读 HEAD 为 `28f34fcb0e0d7b77d6e552001984915bfcea9c7b`，不读取主工作区候选。
下列 Dashin 路径以 `packages/dashin/src/` 为前缀（plugins、sources、templates 除外）。

| 编号 | 状态 / 发布情况 | 当前代码证据 | 家赞参考与真实差异 | 复用回归 / 优先级 |
| --- | --- | --- | --- | --- |
| G01 | 基础已有，alpha.8；可靠性增强未发布 | `components/CrudTable`、`DetailDrawer` | `_shared/EditDrawer.tsx`、`CrudTable.tsx`：状态机、严格失败、草稿保留已复用；本轮补稳定焦点、Tab、原生字段名称、zh/en | DetailDrawer/CrudTable unit + browser drawer；P0 |
| G02 | 部分，基础 alpha.8 | `components/TopBar/TopBarRightMenu/UserMenu.tsx`、`core/auth` | `AccountSwitcher`：已有按 username 的多账号、仅删当前账号+清指针；删除/退出/切换独立策略、外部 token/cache 清理一致性仍缺，不宣称全覆盖 | 既有 auth/authorization unit；Phase 3 身份接口 |
| G03 | 部分，基础 alpha.8 | `components/NestedMenu.isAllowedRole`、`router.ts` | `RoleGate`、`menuByRole`：菜单隐藏不等于直接路由拒绝；capability/路由守卫未实现，本轮仅补子菜单沿用现有 role 过滤 | NestedMenu unit；Phase 3 权限接口，服务端仍是授权边界 |
| G04 | 部分，基础 alpha.8 | `components/ui/DatePicker` | `_shared/DatePicker`：date-only 字符串、清空、i18n 已有；周起始日、日历键盘与 instant/timezone 策略尚缺 | DatePicker unit；Phase 3（不能标为完全等价） |
| G05 | 部分，基础 alpha.8 | `components/ui/ImageEdit`、Payload media helpers | `AvatarEdit/AuthImage`：已有注入上传与普通预览；鉴权 allowlist、身份缓存/blob 回收、PDF/导出恢复缺失 | ImageEdit/Payload media unit；Phase 3 |
| G06 | 部分，基础 alpha.8；本轮可靠性未发布 | `components/RelatedPreview/{PreviewStack,RelatedCard,types}` | `PreviewStack/collectionMeta`：registry、loop guard、cap 已有，不等价于全部下游行为；本轮补嵌套失败、加载失败重试与键盘/焦点；非 id 主键、异步关系选择仍待方案 | RelatedPreview unit + nested browser；P0 / Phase 3 |
| G07 | 发布基线缺失；本地已补 | `components/Table.loadRemote`、`computeStats` | `_shared/CrudTable` DEF-008：seq/abort/mount/route/data-source 守卫，旧成功/失败丢弃、最新失败恢复、刷新实际重查；统计独立，不复制 pageSize=1 业务猜测 | 可控 A/B/C、卸载/换源/路由 unit + orders browser；P0 |
| G08 | 部分，基础 alpha.8；本地已补 | `NestedMenu`、`private/DefaultLayout`、`Table`；3 CLI layouts | 下游 DEF-003/011：长菜单可滚、函数式展开、flyout 钳制+键盘；显式列宽/minTableWidth、单纵滚容器、窄屏抽屉；不复制 CSS 选择器补丁 | en/zh 390×480 真滚动/点击、18 子菜单、axe + template smoke；P0 |
| G09 | 已有，alpha.8；不重复重写 | `utils/scripts/request`、sources CRUD、`DetailDrawer` | `_shared/api/EditDrawer`：严格 reject、业务判别 opt-in、必填/空数组/数字空值及 0 已有；保留家赞防御层，不能泛化全局 success:false 判定 | request、Table、DetailDrawer、D1/Payload unit；复用 |
| G10 | 发布基线缺失；本地已补 | `utils/scripts/signIn`；`plugins/auth-{payload,local,strapi,pocketbase,atomo}` controllers | `PayloadSignIn` DEF-025：catch/finally、类型校验、事务身份写入；Atomo 两 token key 失败补偿，本轮真实 IndexedDB 验证；SSO 自有闭环保持 | signIn、5 类插件、Atomo compensation + auth browser；P0 |
| G11 | 部分，基础 alpha.8 | `Table/components/Selector`、`RelatedPreview/types` | `CatalogPicker`：静态 lookup/摘要已存在，异步搜索分页、历史选项、父级清空、复合明细编辑缺失；医疗规则不上游 | 既有 lookup/RelatedPreview 回归；Phase 3 |
| G12 | 部分，基础 alpha.8；批量增强未发布 | `Table`、`utils/scripts/bulkMutation`、D1/Payload bulk | `HeaderFilter/reviewBatch/EvidencePhoto`：本轮显式 getRowId 跨页/排序选择、每项 outcome/ID/cause/count、未知结果提示/仅失败项重试；typed filter/媒体水印未实现 | Table + D1 products/Payload orders unit + browser；P0 / Phase 3 |

历史核对：#143 错误/媒体 helpers，#144 DatePicker，#145 抽屉 edit 模式，#148 ImageEdit；
CrudTable 与 RelatedPreview 以 tag 中的实际源码与公共导出为依据，而非笼统把 #143–149 全部判为同一能力。
`payloadRequest` 与核心在“传输失败 reject、业务判断归适配器”的边界上对齐，但不宣称响应格式或全部实现等价。
第三阶段最小接口、默认兼容行为、数据源职责和非养老案例见 `docs/design/generalization-interfaces.md`。

### 5.2 第二阶段实施项（独立复核后的当前实现，未发布）

- **A 认证**：共享 `completeSignIn` 校验非空 string username/token（local 显式不要求 token），catch/finally 闭环；Dexie 原子 users/settings 写入，短 `afterPersist` 在提交前执行，`rollbackPersist` 补偿外部 token。Atomo 两 key 捕获旧值并恢复；success notice 失败不把已提交身份误报失败。浏览器真实 IndexedDB 中途缺主键写入/外部存储失败均回滚，不留活跃身份；不使用真实账号。
- **B 查询**：seq/abort/mount 守卫及 route storeKey、remote/local 换源失效；旧成功/失败均丢弃，最新失败退出 loading、Refresh 实际重查并清错误；统计独立取消。CrudTable 关闭未变更预览不刷新，成功保存只刷新一次；没有引入全局缓存。
- **C 批量**：`getRowId` 显式开启跨页/排序选择，缓存最后加载的选中行；默认页内索引行为保留。D1/Payload 使用配置 primaryKey；`BulkMutationError` 保留 legacy resList/counts 并新增每项 outcomes（id/succeeded/failed/unknown/cause）。未知网络/超时提示先核对，不自动重放；部分失败仅保留失败项，不宣称整批事务；批量通知失败不覆盖结构化结果。
- **D 布局/a11y**：原生菜单 button、隐藏项 tabIndex=-1、18+ 子菜单滚动、flyout 视口钳制/箭头/Escape 回焦；Table 显式最小宽度+列宽、筛选/选择/输入原生名称、表头/分页文字对比度；CrudTable 透传 options、单笔删除失败常驻横幅；3 CLI 布局同步单纵滚容器与窄屏间距。
- **E 抽屉/预览**：稳定 onClose ref，最高模态层拥有键盘（包括提交按钮禁用后 focus 落到 body），Tab 约束/逐层回焦，引用计数滚动锁；RelatedCard 键盘可进入，lazy card 与 frame 加载失败有错误/重试，嵌套保存失败保留父草稿。zh/en 浏览器 axe 覆盖列表/导航/抽屉及真实滚动/点击。

公共文档 `docs/features/reliability.md` 标记为 alpha.8 **之后未发布增强**；接口增量默认兼容，
仅显式配置开启跨页选择，不复制家赞字段、角色、端点或媒体。
`afterPersist` 的执行时点已明确为提交前（首轮本地 helper 无已发布兼容调用方）。
如果外部存储本身也拒绝补偿，无法保证跨存储原子性；文档明确这一恢复边界。

### 5.3 首轮历史验证（e5338a4；不作为独立返工最终门禁）

独立复核追加：原先本节为 e5338a4 的首轮历史结果，不作为最终验收。现从
`fix/generalization-reliability-20261007` 保留并复核 4 个本地提交；新增 TODO 覆盖认证跨存储回滚、
显式行标识跨页选择、最新查询失败与重试、键盘路径、CLI 布局同步和真实浏览器门禁。
先保留无配置选择行为，用 `getRowId` 显式开启跨页选择；不猜测业务字段作为主键。

- 认证：`signIn.test.ts` fake db/notify 覆盖成功/拒绝/缺字段/存储失败/重试成功（9 项）；auth-payload 控制器回归（2 项）+ service fail-closed（3 项）；auth-pocketbase（3 项）/auth-atomo（3 项）service 回归。
- Table：可控延迟 Promise 矩阵——挂载仅一次查询、旧慢新快丢弃旧响应、AbortSignal 透传+旧请求 aborted、远程失败横幅+退出 loading、卸载后写回忽略、新结果清空选择（Table 25 项全过）。
- 批量：部分失败结构化文案与失败项保留、全失败、transport throw（Table 25 + D1 27 + Payload 40 项全过）。
- 布局/a11y：Table aria 名称与 minTableWidth 断言、DetailDrawer `role="dialog"`/焦点进出、PreviewStack/NestedMenu 回归（NestedMenu 4 + DetailDrawer 14 + RelatedPreview 5 项全过）；en/zh 文案键齐全，de 沿用 stub 兜底。
- 门禁结果：`yarn tsc:build` 23 包全绿；`yarn workspace @dashin-dev/dashin typecheck` 0 错误；`packages/dashin` 27 文件/195 项单测全过；受影响插件与源包（auth-payload 5 / auth-pocketbase 3 / auth-atomo 3 / source-d1 27 / source-payload 40）全过；`git diff --check` 0 报错（期间发现 TODO/PLAN 曾被写入 CRLF 行尾，已归一为 LF）。
- Playwright E2E：6 passed / 3 skipped / 0 failed（与既有基线一致；3 个 skipped 为需真实后端的 ecommerce 用例）。sign-in 路由与实体表路由在改动后无致命运行时错误。
- 未执行：docs 构建与 template smoke（本轮无模板/docs 构建物变更）；发布、推送、部署均按边界未执行。

### 5.4 独立返工最终门禁与交付（2026-10-07）

后续复核发现跨页测试定位、真实适配器查询信号/rejection 及 HTTP 失败确认仍有缺口。
本节是 5567954 首批门禁历史，不代表三项收尾已完成；本轮按 TODO 收尾项逐项验证，
既有代码小范围修正，不推倒重写、不推送/发布、不改家赞。

环境：Windows、Node **20.20.2**（逐命令 PATH 隔离，未切换全局 Node）、Yarn **1.22.22**。
门禁执行时为基线 e5338a4 + 本轮 dirty 改动；随后无代码变更分组提交，代码 HEAD 为
`3af14d3`。文档收尾另有提交，不把历史 195 或 Phase 12 的 175 当作当前结果。

| 命令 / 范围 | scheduled / passed / skipped / failed 或真实结果 |
| --- | --- |
| `yarn install --frozen-lockfile` | 通过；提交后再次运行 Already up-to-date，lock 未漂移 |
| `yarn tsc:build` | 23 projects 成功 |
| `yarn workspace @dashin-dev/dashin typecheck` | exit 0 |
| `yarn workspace @dashin-dev/dashin build` | Vite production build 成功 |
| `yarn workspace @dashin-dev/dashin test` | 29 files；214 / 214 / 0 / 0 |
| `yarn workspace @dashin-dev/source-d1 test` | 4 files；28 / 28 / 0 / 0 |
| `yarn workspace @dashin-dev/source-payload test` | 8 files；41 / 41 / 0 / 0 |
| `yarn workspace @dashin-dev/auth-payload test` | 2 files；5 / 5 / 0 / 0 |
| `yarn workspace @dashin-dev/auth-atomo test` | 2 files；5 / 5 / 0 / 0 |
| `yarn workspace @dashin-dev/auth-pocketbase test` | 1 file；3 / 3 / 0 / 0 |
| `yarn workspace @dashin-dev/dashin e2e --workers=1` | 16 / 13 / 3 expected / 0（串行最终轮） |
| `npm run build --prefix docs` | VitePress build 通过，已加入 2 页导航 |
| `yarn smoke:template` 连续两次 | 都完成 pack/install/prod-build/headless assert；端口 50904、49964；不是 build-only |
| `git diff --check`、`git diff --check origin/master...HEAD` | 都 exit 0（含原有 4 个本地提交） |

受影响单测总计 **296 passed / 0 skipped / 0 failed**。auth-local/Strapi 无独立 test script，
由共享 helper 回归、类型检查及 23 包编译覆盖；未声称真实认证后台验证。
7 项新增 browser 用例均为合成 orders/products：真实 IndexedDB 的失败写入回滚/修改后成功、
可控 A/B/C 请求、跨页只重试失败产品、zh/en 短移动视口菜单/末列/抽屉路径、嵌套失败回焦与
父草稿，以及未变更关闭不重查/成功保存只刷新一次。列表、导航、抽屉 scoped axe WCAG2 A/AA
均 0 违规；auth fixture 收集的 pageerror 为 0。3 个跳过为既有需真实电商后台的用例。

中间失败如实保留：初版 E2E 模块加载问题已修正；axe 发现对比度和 list 语义失败后已修正；
嵌套保存后的 body focus 导致 Escape 失效已修正。另一次同仓 Vite build 与 E2E 并发运行出现
`auth plugin is required`（12 passed / 3 skipped / 1 failed），推断是共享生成文件/HMR 竞争；
改为 build → unit → E2E 串行后完整 13/3/0。今后避免并发操作同一 `.dashin` 生成目录。

本地主题提交（未推送）：

- `5876cc2` — auth helper 与 Atomo token 补偿回归。
- `c4d06e8` — Table/CrudTable query、显式选择、D1/Payload bulk metadata 与测试。
- `3af14d3` — 原生菜单、抽屉/预览焦点、3 CLI layouts、browser fixtures 与 axe。
- docs 收尾 — 当前差异表、公开可靠性说明、第三阶段接口方案、真实门禁/TODO。

依赖审计：只新增测试 devDependency `axe-core@4.10.3` 及对应 5 行 lock 条目，未改其他依赖；
smol-toml 实际仍为 **1.7.1**。已检查编译后的公共 d.ts 导出
`completeSignIn`/`CompleteSignInOptions`、`BulkMutationError`/outcome types、
`TableProps.getRowId`、`Options.minTableWidth`、`CrudTableProps.getRowId/options`。
测试夹具在 e2e 目录，不进入只包含 lib/plugin.js 的 core npm files。

边界与风险：仅本地 Windows/Chromium，未触发 GitHub/Linux CI、未部署、未发布/打 tag；
Next.js/fullstack-atomo 本轮只同步布局，未单独做其运行时 smoke（现有 smoke 为 Vite）。
既有 Nx 循环任务图/不匹配 resolution、React act、Rollup circular chunk、模板大 chunk 与
上游 deprecated 依赖警告为非阻断，未扩大范围升级工具链。
外部 token 补偿不是分布式事务；网络未知不能盲目重放；跨页行快照须服务端校验。
第三阶段权限、身份生命周期、日期/关系/媒体/复合字段只提供接口设计，没有隐式实施。
清理了本轮 test-results（仅最后运行元数据），两个 smoke 临时目录由脚本自动删除；
保留已有 gitignored lib/dist 构建输出，不删除用户既有产物。家赞参考目录未写入。

### 5.5 三项可靠性收尾复核（基线 5567954；2026-10-07）

本轮只收尾复核指出的三个缺口，不重做 Phase 15，不改变家赞或已发布 alpha.8。

- 跨页选择改为按精确 SKU 单元格定位 product-1/product-3 行；等待旧行离开、
  目标行可见、上一页可用/下一页禁用及复选框选中，再执行批量操作。断言失败横幅、
  保留选择及提交 ID；重试记录必须为 product-1/product-3/product-3，不能重复成功项。
- Payload controller → listSer → GET、D1 controller → listSer → execute → COUNT/SELECT
  均传递同一个 Query.signal。业务失败和缺少配置 reject，保留原始错误/上下文；
  COUNT 失败不再继续 SELECT，查询控制器不发瞬时 notice，真正空列表仍正常 resolve。
  自定义 listService 接收 Query，零参数旧回调仍兼容，自定义网络取消由回调负责。
- 核心结果判定不再从任何 HTTP 状态推断“未写入”，默认 unknown；只有适配器的
  显式 outcome 才确认 failed。覆盖 400/401/403/408/409/422/500/502/503/504，
  并在 Payload/D1 各补 500/502/503 与显式 failed 对照。业务包判别仍在适配器，
  没有开启核心全局 errors/ok/success 字段猜测，也不自动重放未知变异。

验证环境为 Windows、Node **20.20.2**、Yarn **1.22.22**、Chromium。当前真实结果：

| 门禁 | 结果 |
| --- | --- |
| frozen install | 通过；package.json/yarn.lock 本轮无变化 |
| 23 包 tsc:build / core typecheck | 通过；公开 d.ts 包含可选 execute signal 与 listService(Query) |
| Core / Payload / D1 单测 | **224 / 51 / 38 passed** |
| auth-payload / auth-atomo / auth-pocketbase 单测 | **5 / 5 / 3 passed**；合计单测 **326 passed** |
| reliability.spec.ts ×3，retries=0 | **21 passed / 0 skipped / 0 failed**（3 workers 压力重复） |
| 全套 E2E 连续两轮，workers=1、retries=0 | scheduled **32**，**26 passed / 6 expected skipped / 0 failed**；每轮 13/3/0 |
| Vite production build / VitePress build | 通过 |
| template smoke 连续两次 | 均通过；preview 65203 / 60952，挂载且无致命错误 |
| git diff --check | 通过 |

没有本轮失败后只挑单测重跑的“假绿”：修正后第一次完整 reliability 三次重复即通过，
之后全套 E2E 串行两轮也均通过。六个跳过是两轮各三个依赖未配置真实后端的既有
ecommerce 测试，不是新增可靠性用例跳过。合成 fixtures 与 mocked transport 不宣称
证明生产后端事务；两条 adapter 单测仅替换网络边界，未 mock controller/listSer/execute。

GitHub CI 工作流已核对为 Node 20、manual-only，覆盖 core/Payload/D1、E2E 与模板。
本轮尚未推送或触发 CI；必须另获推送授权后在此候选 SHA 上运行，不能拿旧远端 SHA
的绿色记录代替。保持功能分支和已有提交，不创建 PR/Tag/Release、不部署、不发布。
Nx/resolution、React act、Rollup circular chunks、模板 deprecated/large chunk 为既有
非阻断警告。入场时用户已有未跟踪 test-results/.last-run.json，已备份并原样恢复，
不将其纳入提交；本轮 smoke 临时目录由脚本自动清理，保留已有 gitignored 构建产物。
