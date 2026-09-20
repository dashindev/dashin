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
