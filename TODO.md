# Dashin & Atomo 融合工程 TODO 追踪清单

> **开发规范声明**：根据 `AGENTS.md` 中的【TODO 驱动开发规范】，所有新功能、重构与跨系统集成必须以本文档为唯一进度跟踪源。
> **原则**：细粒度拆解、**每实现一项立即勾选对应 TODO**、勾选前必须通过编译和测试验证。

---

## 📊 总体实施里程碑与进度概览

- [x] **Phase 0: 深度调研、架构论证与规范确立** (已完成)
- [x] **Phase 1: 契约连接器与鉴权层 (`@dashin-dev/source-atomo` & `@dashin-dev/auth-atomo`)** (已完成)
- [x] **Phase 2: Dashin 运行时动态 Schema 引擎 (Dynamic Schema Engine)** (已完成)
- [x] **Phase 3: 关系穿透升维与一致性策略 (`RelatedPreview` 集成)** (已完成)
- [x] **Phase 4: Atomo 高阶资产吸收与插件化 (BlocksEditor, Observability, Workflows)** (已完成)
- [x] **Phase 5: 全栈脚手架闭环、E2E 测试与生态平替** (已完成)
- [x] **Phase 6: 架构边界治理与 Atomo 嵌入式单镜像交付闭环** (已完成)
- [x] **Phase 7: 下游应用容器本地联调与生产部署验证 (方案二: 容器挂载联调)** (已完成)
- [x] **Phase 8: Atomo Admin UI 全量页面与基础组件 Dashin 风格/组件全面重构** (已完成)
- [x] **Phase 9: Atomo Admin UI 真正接入 Dashin 核心组件库与 RelatedPreview 架构 (方案 A 落地)** (已完成)
- [x] **Phase 10: Docker 镜像云端构建与 GitHub Official Release 闭环** (已完成)
- [x] **Phase 11: 商业化落地与企业级价值交付闭环** (已完成)
- [x] **Phase 12: 严格变异契约与 CRUD 错误冒泡治理 (Strict Mutation Contract)** (已完成；待所有者决定是否推送/发起 CI)
- [ ] **Phase 13: `smol-toml` 构建工具链 DoS 安全修复** (进行中)

---

## 🛠️ 详细任务拆解与实时追踪

### Phase 0: 深度调研、架构论证与规范确立 (Completed)
- [x] 分析当前项目 Dashin 的架构定位、Connector 体系与现有短板。 *(2026-09-06)*
- [x] 解构 PayloadCMS 3.0 的技术壁垒（Code-first, Local API, Blocks, Hooks, Access Control, i18n）。 *(2026-09-06)*
- [x] 调研 Go/Rust 社区生态（PocketBase, QOR5, TrailBase 等），确认高性能 CMS 生态空白。 *(2026-09-06)*
- [x] 深入剖析自研项目 Atomo 的 Rust 核心架构（事件溯源, CQRS, Actions & Workers, TS DSL）。 *(2026-09-06)*
- [x] 审查 `atomo-admin-ui` 的动态自发现与表单引擎源码，论证 Dashin 的胜任度与超越点。 *(2026-09-06)*
- [x] 制定 AI Agent 的【TODO 驱动开发规范】，并写入 `dashin/AGENTS.md` 与 `atomo/AGENTS.md`。 *(2026-09-06)*
- [x] 输出完整的实施方案文档 `docs/atomo-integration/IMPLEMENTATION_PLAN.md`。 *(2026-09-06)*

---

### Phase 1: 契约连接器与鉴权层 (`source-atomo` & `auth-atomo`) (Completed)
- [x] **1.1 初始化包结构** *(2026-09-06)*
  - [x] 在 `packages/dashin-source-atomo` 创建 Lerna 模块骨架（`package.json`, `tsconfig.json`, `src/index.ts`）。
  - [x] 配置构建脚本与类型定义，确保 `tsc` 与 `vitest` 编译通过。
- [x] **1.2 元数据客户端 (Metadata Client)** *(2026-09-06)*
  - [x] 实现 `fetchAtomoMetadata(options)`，调用 Atomo `/meta/schema` 获取模型全量描述。
  - [x] 编写 TypeScript 类型定义映射（`AtomoModelMeta`, `AtomoFieldMeta`, `AtomoSchemaMeta` 等）。
  - [x] 实现元数据 BaseUrl 解析与 Token 动态注入。
- [x] **1.3 GraphQL 与 REST 双通道查询控制器 (`dataCtrl`)** *(2026-09-06)*
  - [x] 将 Dashin `TableQuery`（page, pageSize, filters, search, orderBy）映射为 Atomo GraphQL paginatedRecords 查询。
  - [x] 支持操作符转换：`=`、`!=`、`contains`、`in`、`gt`、`gte`、`lt`、`lte`、`startsWith` 等映射至 Atomo `where` 结构。
  - [x] 解析 Atomo 返回的 paginatedRecords 数据，转换为 Dashin 标准 `{ data, totalCount, page }` 结构。
- [x] **1.4 写入与变更控制器 (`editableCtrl` & `bulkDeleteCtrl`)** *(2026-09-06)*
  - [x] 实现 `onRowAdd`：向 Atomo GraphQL 提交 `create` mutation。
  - [x] 实现 `onRowUpdate`：提交 `update` mutation。
  - [x] 实现 `onRowDelete`：调用 `delete` mutation。
  - [x] 封装批量删除控制器 `bulkDeleteCtrl` 与错误格式化解析器。
- [x] **1.5 鉴权插件 (`plugins/auth-atomo`)** *(2026-09-06)*
  - [x] 创建 `plugins/auth-atomo` 插件，对接 Atomo `/auth/login` 与 `/auth/me`。
  - [x] 实现 Token 持久化、请求拦截器注入（`Authorization: Bearer <token>`）以及 401 自动重定向。
- [x] **1.6 单元测试与基线验证** *(2026-09-06)*
  - [x] 编写 Vitest 单元测试覆盖 `dataCtrl`、`editableCtrl`、`filter` 以及 `auth-atomo`，11 个测试全部通过。

---

### Phase 2: Dashin 运行时动态 Schema 引擎 (Dynamic Schema Engine) (Completed)
- [x] **2.1 动态模型到 Columns 映射器 (`atomoFieldsToDashinColumns`)** *(2026-09-06)*
  - [x] 映射基础字段：string, number, boolean, datetime, email, url。
  - [x] 映射枚举与下拉字段：自动转换为 Dashin `lookup` / `Select` 控件。
  - [x] 映射只读/计算字段（如 `createdAt`, `updatedAt`, `id`，设置 `editable: "never"`）。
  - [x] 支持 `listView` 筛选：仅将 Schema 中标明的列表字段默认展示，其余置为 drawer 详情显示。
- [x] **2.2 动态路由与视图容器 (`DynamicAtomoProvider` & `DynamicAtomoEntity`)** *(2026-09-06)*
  - [x] 创建通配实体页面组件 `DynamicAtomoEntity`，通过模型名称定位定义。
  - [x] 组装 Dashin `<CrudTable>` 所需的 `title`, `columns`, `dataCtrl`, `editableCtrl`。
  - [x] 接入 Dashin `DetailDrawer`，实现零手写代码的动态查看、创建与编辑抽屉。
- [x] **2.3 动态侧边栏菜单生成 (`buildAtomoMenuData`)** *(2026-09-06)*
  - [x] 根据 `/meta/schema` 返回的 models 列表，动态生成 Dashin `NestedMenu` 路由项。
  - [x] 自动根据实体名称推断语义化 Eva 图标（users, orders, deals, companies 等）。
  - [x] 支持基于 Atomo `access.read` 规则隐藏当前用户角色无权访问的模型菜单。
- [x] **2.4 零代码即时响应验证** *(2026-09-06)*
  - [x] 编写 `schemaMapper.test.ts`、`menuBuilder.test.ts`、`components.test.tsx` 单元测试，全部 17 个测试通过，TypeScript 编译通过。

---

### Phase 3: 关系穿透升维与一致性策略 (`RelatedPreview` 集成) (Completed)
- [x] **3.1 关系元数据注册器 (`CollectionRegistryBuilder`)** *(2026-09-06)*
  - [x] 解析 Atomo Schema 中的 `relationships`（多对一、一对多），实现 `extractModelRelations` 与 `buildAtomoRegistry`。
  - [x] 自动构建 Dashin `RelatedPreviewProvider` 所需的 `CollectionRegistry` 字典，配置 `fetch`、`columns`、`editable` 及 `meta`。
- [x] **3.2 字段级关系渲染与层叠抽屉穿透** *(2026-09-06)*
  - [x] 在 `atomoFieldsToDashinColumns` 中，对关系字段注入 `renderDetail: (row) => <RelatedCard slug={targetModel} value={row[foreignKey]} />` 与列表页卡片。
  - [x] 在 `DynamicAtomoProvider` 自动包裹 `<RelatedPreviewProvider collections={registry}>`，跨实体钻取支持面包屑与 Loop Guard。
- [x] **3.3 CQRS 读模型一致性体验调优 (Read-Your-Own-Writes)** *(2026-09-06)*
  - [x] 在 `editableCtrl.onRowUpdate` / `onRowAdd` 成功后，合并乐观返回值 `{ ...newData, ...res }`，并提供 `consistencyDelayMs` 支持，消除 Atomo 异步投影延迟闪烁。
  - [x] 编写 `registryBuilder.test.ts`、`atomo.test.ts` 对应测试，Phase 3 全量 20 个测试通过。

---

### Phase 4: Atomo 高阶资产吸收与插件化 (Blocks, Observability, Workflows)
- [x] **4.1 拖拽式块编辑器插件 (`@dashin-dev/field-blocks`)** *(2026-09-06)*
  - [x] 将 `atomo-admin-ui` 中的 `EnhancedBlocksEditor`、`BlocksEditor`、`DragDropHelpers` 提取并重构为独立包 `packages/dashin-field-blocks`。
  - [x] 适配 Dashin Tailwind 设计 Token (`bg-content-box`, `border-bn-border`, `text-foreground`, `rounded-bn`) 与深浅主题。
  - [x] 实现 `BlocksPreviewer` 与 `BlocksField`，支持 DetailDrawer 弹窗/抽屉全屏可视化画板编辑与表格单元格徽章预览。
  - [x] 编写 `DragDropHelpers.test.ts`、`BlocksEditor.test.tsx`、`BlocksField.test.tsx` 单元测试，9 个测试全量通过，TypeScript 编译通过。
- [x] **4.2 Atomo 事件与投影器运维面板插件 (`@dashin-dev/plugin-atomo-observability`)** *(2026-09-06)*
  - [x] 移植并重构 `ObservabilityView` 为独立插件 `plugins/atomo-observability`，采用 Dashin 风格设计 Token (`bg-content-box`, `border-bn-border`, `rounded-bn`) 与深浅主题。
  - [x] 实时监控异步队列健康（queued, running, succeeded, failed, dead）、最长积压报警、任务执行历史与审计日志流。
  - [x] 接入 CQRS 读模型投影器（`ProjectorsPanel`），展示 Stream Offset 与 Lag，并提供一键触发全量 Replay 重建能力。
  - [x] 编写 `observability.test.tsx` 单元测试，4 个测试全量通过，TypeScript 编译通过。
- [x] **4.3 Atomo 工作流设计器插件 (`@dashin-dev/plugin-atomo-workflows`)** *(2026-09-06)*
  - [x] 移植并重构 `WorkflowDesigner` 与 `WorkflowGraphView` 为独立插件 `plugins/atomo-workflows`，采用 Dashin 风格设计 Token。
  - [x] 适配 Atomo 声明式状态机与 Action 管道（`SetVariable`, `Delay`, `Http`, `Mutation`, `Plugin`），实现步骤上移/下移、增删与参数编辑。
  - [x] 实现 `WorkflowsView` 工作流总览控制台，支持手动一键触发执行、状态运行结果展示与实时双向图渲染。
  - [x] 编写 `workflows.test.tsx` 单元测试，4 个测试全量通过，TypeScript 编译通过。
- [x] **4.4 Dashin 官方原生设计体系与组件最大化复用 (Design Token & UI Primitives Reuse)** *(2026-09-06)*
  - [x] 彻底剥离 Atomo 原有 `@radix-ui/react-*`、`@tanstack/react-query` 与 `class-variance-authority` 重度依赖。
  - [x] 在 `dashin-field-blocks`、`atomo-observability`、`atomo-workflows` 全面直接复用 `@dashin-dev/dashin` 原生导出的 UI Primitives（`Card`, `Button`, `Input`, `Select`, `Textarea`, `Label`, `Badge`）。
  - [x] 统一接入 Dashin Tailwind 设计 Token（`bg-content-box`, `border-bn-border`, `rounded-bn`, `text-foreground`, `shadow-bn`），开箱自适应深浅主题与全局响应式规范。

---

### Phase 5: 全栈脚手架闭环、E2E 测试与生态平替 (Completed)
- [x] **5.1 全栈集成与 E2E 冒烟测试** *(2026-09-06)*
  - [x] 编写 Playwright E2E 自动化测试用例 `packages/dashin/e2e/atomo.spec.ts`，覆盖 Atomo 动态实体加载、可观测性大盘、工作流设计器无运行时崩溃验证。
- [x] **5.2 打造全栈脚手架模板 (`dashin-cli/templates/fullstack-atomo`)** *(2026-09-06)*
  - [x] 在 `dashin-cli` 中新增全栈模板，内置 `docker-compose.yml`（Atomo Rust 核心 + Postgres + Dashin Vite 前端）及集成依赖。
  - [x] 在 `dashin-cli` 中支持 `dashin new my-app --template atomo` 或 `--atomo` 一键初始化全栈项目。
- [x] **5.3 官方生态整合与 `atomo-admin-ui` 平滑平替** *(2026-09-06)*
  - [x] 更新 `atomo` 根目录 `README.md` 与 `README.zh-CN.md`，正式推荐 Dashin 作为 Atomo 官方首选生产级企业 Admin 框架。
  - [x] 整理迁移指南，确保既有 Atomo 用户能够平滑切换到 Dashin，淘汰旧有简易 UI。

---

### Phase 6: 架构边界治理与 Atomo 嵌入式单镜像交付闭环 (Completed)
- [x] **6.1 通用资产与专属资产清晰划界** *(2026-09-06)*
  - [x] 在 `dashin` 仓库专注维护标准通用资产：`@dashin-dev/source-atomo`（官方连接器）、`@dashin-dev/auth-atomo`（标准鉴权插件）与 `@dashin-dev/field-blocks`（通用画板字段）。
  - [x] 将 Atomo 专属的 CQRS 运维大盘与工作流控制台剥离出 Dashin 核心仓库，回归 `atomo/packages/atomo-admin-ui` 内部维护，保持 Dashin 仓库精简中立。
- [x] **6.2 保障 Atomo 单 Docker 镜像交付优势** *(2026-09-06)*
  - [x] 确立 Atomo 嵌入式管理台基于 Dashin 架构（依赖 `@dashin-dev/dashin`），并在 `atomo` 仓库内完成自包含静态构建与 Axum `/admin` 原生伺服。
  - [x] 保障 `docker run -p 3000:3000 atomo-server` 开箱即得生产级 Dashin Admin UI，实现极简部署与高效本地开发闭环。

---

### Phase 7: 下游应用业务模型本地联调与生产部署验证 (方案二: 容器挂载联调) (已完成)
- [x] **7.1 准备与构建 Admin UI 静态产物** *(2026-09-06)*
  - 确认/构建基于 base `/admin/` 的静态 SPA 产物（产物位于 `atomo/packages/atomo-admin-ui/dist`），`tsc && vite build --base=/admin/` 构建成功（8.45s）。
- [x] **7.2 配置下游业务后端本地 Docker Compose 挂载** *(2026-09-06)*
  - 在下游业务服务 `docker-compose.yml` 中挂载 `../../atomo/packages/atomo-admin-ui/dist:/app/admin:ro` 并显式配置 `ATOMO_ADMIN_DIR: /app/admin`。
- [x] **7.3 启动本地后端并执行容器服务冒烟** *(2026-09-06)*
  - 启动下游业务后端 `db`、`server`、`migrate` 容器成功（服务端口映射至 60503）。
  - 验证 `http://localhost:60503/meta/schema` 成功返回业务系统核心数据模型元数据。
- [x] **7.4 验证 Admin UI 静态伺服与子路径路由** *(2026-09-06)*
  - HTTP 请求验证 `http://localhost:60503/admin/` 正常返回 200 与 `index.html`。
  - 验证静态资源（`/admin/assets/*.css` 和 `/admin/assets/*.js`）正确返回 200。
  - 验证 SPA 回退路由（如 `/admin/entities/:model`）正常回退至 `index.html`，状态码 200，无 404。
- [x] **7.5 模拟管理员鉴权与核心模型数据联调** *(2026-09-06)*
  - 验证使用管理员凭据成功通过 `/auth/login` 获取真实 JWT Token，并通过 `/auth/me` 校验 Admin 身份。
  - 通过 GraphQL `paginatedRecords` 成功内省与拉取真实业务数据记录。
  - 验证审计台账模型的只读防篡改机制：触发 delete mutation 被后端严格拦截返回 `Access denied for 'delete'`，与 Dashin 前端权限规则完全匹配。
- [x] **7.6 整理测试结果与上线部署操作规程** *(2026-09-06)*
  - 汇总测试结果、日志证据与验证结论，确认容器单端口静态托管、SPA 回退路由、JWT 鉴权及模型数据读写权限全部通过。
  - 输出基于 Watchtower 自动拉取与 Portainer 的生产环境标准上线规程。

---

### Phase 8: Atomo Admin UI 全量页面与基础组件 Dashin 风格/组件全面重构 (All Views & UI Primitives Upgrade) (已完成)
- [x] **8.1 基础 UI 原语 (UI Primitives) Dashin 规范重构** *(2026-09-06)*
  - [x] `Card.tsx`: 适配 `bg-content-box border-bn-border rounded-bn shadow-bn text-foreground`，移除硬编码 `bg-white border-gray-200 text-gray-900`。
  - [x] `Button.tsx`: 适配 Dashin `rounded-bn font-medium shadow-sm transition-all` 与 `primary: bg-primary hover:bg-primary-hover text-white`, `secondary: bg-content-box border-bn-border text-foreground hover:bg-content-bg`, `ghost`, `danger`, `outline` 等变体。
  - [x] `Badge.tsx`: 适配 Dashin 语义 badge 规范（`default`, `secondary`, `success: bg-emerald-500/10 text-emerald-600 border-emerald-500/20`, `danger: bg-rose-500/10 text-rose-600 border-rose-500/20`, `warning: bg-amber-500/10 text-amber-600 border-amber-500/20`）。
  - [x] `Input.tsx` & `Textarea.tsx`: 适配 `rounded-bn border-bn-border bg-content-box text-foreground placeholder:text-icon-muted focus:ring-primary/40 focus:border-primary`。
  - [x] `Table.tsx`: 适配 `border-bn-border text-foreground hover:bg-primary/5`，表头 `bg-content-bg/50 text-icon-muted text-xs uppercase tracking-wider`。
  - [x] `Select.tsx` & `DropdownMenu.tsx` & `Dialog.tsx`: 适配 `bg-content-box border-bn-border text-foreground shadow-bn rounded-bn` 浮层与项目悬浮态。
  - [x] `Tabs.tsx`, `Switch.tsx`, `Checkbox.tsx`, `DatePicker.tsx`, `Tooltip.tsx`: 统一 Dashin 圆角、边框与主题色彩。
- [x] **8.2 核心业务视图 (Views) Dashin 风格与交互升级** *(2026-09-06)*
  - [x] `ObservabilityView.tsx`: 队列监控卡片升级为 Dashin KPI 统计卡片（`bg-content-box rounded-bn border-bn-border`），重构状态筛选器与任务/审计表格为 Dashin 优雅表格样式。
  - [x] `WorkflowsView.tsx`: 升级工作流列表卡片、运行结果日志区域及 JSON 注册表单为 Dashin 现代面板与操作按钮组。
  - [x] `WorkflowDesigner.tsx` & `WorkflowGraphView.tsx` & `ActionEditor.tsx`: 升级步骤卡片、Trigger 节点、连接线及参数配置表单为 Dashin 规范。
  - [x] `Settings.tsx`: 重构账户信息、服务器构建版本及平台配置展示为 Dashin 卡片组，支持优雅分割线与高对比度元数据行。
  - [x] `TrashView.tsx`: 重构回收站模型选择器、空状态以及软删除记录列表/操作按钮为 Dashin 风格。
  - [x] `Help.tsx`: 重构帮助资源卡片网格与版本信息卡片为 Dashin 现代化悬浮卡片。
  - [x] `EntityDetailView.tsx`: 重构记录详情/创建/编辑页面顶部操作条、Tabs 切换栏、动态表单容器以及变更历史时间线。
- [x] **8.3 表单与高级过滤器组件 Dashin 风格升级** *(2026-09-06)*
  - [x] `DynamicForm.tsx` & `FormField.tsx`: 标签文本色彩、帮助提示、验证错误与表单操作栏统一 Dashin 规范。
  - [x] `AdvancedFilterPanel.tsx` & `TableSettings.tsx` & `EntityTable.tsx`: 侧滑抽屉/浮层、条件输入行、拖拽排序与导出弹窗统一 Dashin 规范。
- [x] **8.4 编译构建、静态产物更新与本地业务环境验证** *(2026-09-06)*
  - [x] 执行 `pnpm build:server` 重新构建 `atomo-admin-ui` 静态产物到 `dist/`（5.69s 编译成功）。
  - [x] 通过 Playwright 自动化测试脚本验证 `http://localhost:60503/admin` 所有页面（Dashboard, EntityListView, EntityDetailView, Workflows, WorkflowDesigner, Observability, Settings, Trash, Help）渲染正常、设计 Token 全面生效且深浅主题切换正常。

---

### Phase 9: Atomo Admin UI 真正接入 Dashin 核心组件库与 RelatedPreview 架构 (方案 A 落地) (已完成)
- [x] **9.1 依赖联通与编译配置 (Dependency Link & Build Configuration)** *(2026-09-06)*
  - [x] 在 `dashin/packages/dashin-source-atomo` 中修正 `rootDir: ./src` 并打包生成 `dashin-dev-source-atomo-2.0.0-alpha.7.tgz`。
  - [x] 在 `atomo/packages/atomo-admin-ui` 中通过 pnpm 安装 `@dashin-dev/dashin@2.0.0-alpha.7` 与本地 vendor 归档的 `@dashin-dev/source-atomo`。
  - [x] 执行 `pnpm run type-check` 验证 TypeScript 零阻碍通过类型检查，保障 Atomo Docker 镜像纯离线构建完全自包含。
- [x] **9.2 注入 DynamicAtomoProvider 与 RelatedPreview 全局上下文** *(2026-09-06)*
  - [x] 在 `atomo-admin-ui/src/App.tsx` 顶层配置 `<DynamicAtomoProvider baseUrl={apiClient.baseUrl}>`，自动获取 Atomo Schema 并动态初始化全系统 `CollectionRegistry`。
  - [x] 注入 `RelatedPreviewProvider`，提供全局 3 层钻取与循环引用保护。
- [x] **9.3 重构实体路由与视图：全面使用 DynamicAtomoEntity (原生 CrudTable)** *(2026-09-06)*
  - [x] 将 `/admin/entities/:model` 视图重构为挂载 `<DynamicAtomoEntity>`。
  - [x] 实体列表直接由 Dashin 官方 `<CrudTable>` 驱动（开箱即用集成排序、搜索、列条件过滤、批量删除与 `<DetailDrawer>`）。
  - [x] 验证外键关系字段自动渲染为 `<RelatedCard>`，点击即刻触发多层抽屉钻取预览。
- [x] **9.4 废弃并清理本地手写冗余表格与抽屉逻辑** *(2026-09-06)*
  - [x] 彻底删除本地手写的 `EntityListView.tsx`、`EntityTable.tsx` 以及旧 `DetailDrawer.tsx`。
  - [x] 保持工作流（Workflows）、可观测性（Observability）、系统设置（Settings）等 Atomo 特色视图作为外挂模块与 Dashin 优雅共存。
- [x] **9.5 生产构建、容器挂载与 Playwright 全流程自动化验证** *(2026-09-06)*
  - [x] 配置 `vite.config.ts` 中的 `commonjsOptions: { strictRequires: true, transformMixedEsModules: true }` 与 `resolve.dedupe: ['react', 'react-dom', 'react-router-dom']`，彻底消除 CJS 初始化与路由上下文隔离问题。
  - [x] 执行 `pnpm run build:server` 完成静态构建（10.67s 编译成功）。
  - [x] 编写并执行端到端 Playwright 自动化测试脚本，验证实体列表（CrudTable）、详情抽屉（DetailDrawer View/Edit 模式）正常渲染与交互，生成截图存档。

---

### Phase 10: Docker 镜像云端构建与 GitHub Official Release 闭环 (已完成)
- [x] **10.1 发布 Docker 镜像至 GitHub Container Registry (GHCR)** *(2026-09-06)*
  - [x] 触发 GitHub Actions 工作流 `.github/workflows/docker.yml`（Run ID 34014483878）。
  - [x] 成功在云端构建生产多阶段 Docker 镜像并推送至 `ghcr.io/atomo-cc/atomo-server:v0.6.5` 与 `latest` 标签。
- [x] **10.2 发布 GitHub Official Release** *(2026-09-06)*
  - [x] 生成并发布官方 GitHub Release `v0.6.5`（[Release v0.6.5](https://github.com/atomo-cc/atomo/releases/tag/v0.6.5)）。
  - [x] 包含 Dashin 核心架构演进说明、CrudTable / RelatedPreview 深度整合、设计 Token 全面统一与 Docker 部署拉取说明，并设置为 `Latest` 正式发布版。

---

### Phase 11: 商业化落地与企业级价值交付闭环 (已完成)
- [x] **11.1 商业化战略与实战路径专区 (`docs/commercialization/STRATEGY.md`)** *(2026-09-08)*
  - [x] 沉淀经市场校验的商业化战略报告（三阶段推进、定价阶梯、企业级功能门禁矩阵、对标 Retool/Refine/ToolJet 分析）。
  - [x] 规划“高客单交钥匙实施 + 商业版授权”双轮驱动模型与客户采购沟通指南。
- [x] **11.2 企业级核心采购刚需：通用 SSO / SAML 身份认证插件 (`plugins/auth-sso`)** *(2026-09-08)*
  - [x] 初始化 `plugins/auth-sso` 模块，提供标准 OIDC、SAML 2.0、Okta、Azure AD (Entra ID)、Google Workspace 统一对接能力。
  - [x] 实现灵活的 IDP 路由分发、属性映射（Claims to User/Role mapping）与单点登录拦截重定向。
  - [x] 编写 Vitest 单元测试覆盖 SSO 流程与配置校验，确保 11 项单测 100% 通过且 TypeScript 零警告编译。
- [x] **11.3 企业级审计合规追踪器插件 (`plugins/audit-log`)** *(2026-09-08)*
  - [x] 实现用于满足 SOC2/合规要求的高级审计中间件与可视化抽屉，捕获 CRUD 行为、操作人、IP、时间戳与字段前后差异（Diff）。
  - [x] 自动脱敏敏感凭据（Password, Secret, API Key）并排除高频时间戳噪点。
  - [x] 编写 Vitest 单元测试覆盖新增/删除/修改差异比对与拦截器异常抛转，8 项单测 100% 通过且 TypeScript 零警告编译。
- [x] **11.4 商业化解决方案与企业落地页营销展示 (`docs/enterprise`)** *(2026-09-08)*
  - [x] 提炼 3 大高利润破局场景：AI Agent & 工作流运维中台（Human-in-the-Loop）、出海高性能 BaaS、单 Docker 私有化合规中台。
  - [x] 产出高转化的商业化官网文案、方案对比表（Community vs Pro vs Enterprise）与企业咨询（Book an Architecture Review）架构说明。
  - [x] 成功集成入 VitePress 官方文档导航栏并经由 `vitepress build` 验证 100% 静态编译通过。
- [x] **11.5 全量构建、测试与质量门禁验证** *(2026-09-08)*
  - [x] 执行 `yarn tsc:build` 验证全 Monorepo 23 个包并行构建 100% 通过（Lerna Nx 47.33s 全绿）。
  - [x] 执行 `yarn test` 确保核心框架 140 项单测 + 新增企业模块 19 项单测全部 100% 绿灯通过。
  - [x] 执行 `yarn workspace @dashin-dev/dashin typecheck` 零警告零错误。
- [x] **11.6 NPM 官方发布闭环与注册表验证** *(2026-09-08)*
  - [x] 通过 WebAuthn 硬件安全密钥与 Web 认证流（`npm login --auth-type=web` + `npm publish --access public`）完成免 TOTP 代码安全发布。
  - [x] 成功发布全套 5 个包至 npm 官方注册表：
    - `@dashin-dev/field-blocks@2.0.0-alpha.7`
    - `@dashin-dev/source-atomo@2.0.0-alpha.7`
    - `@dashin-dev/auth-atomo@2.0.0-alpha.7`
    - `@dashin-dev/auth-sso@2.0.0-alpha.7`
    - `@dashin-dev/audit-log@2.0.0-alpha.7`
  - [x] 验证 `npm view <pkg> version` 均已正式上线，Git HEAD 元数据记录并同步至 GitHub master。

---

### Phase 12: 严格变异契约与 CRUD 错误冒泡治理 (Strict Mutation Contract) (已完成；待所有者决定是否推送/发起 CI)
- [x] **12.1 核心请求层业务错误检测治理 (`packages/dashin/src/utils/scripts/request.ts`)** *(2026-09-20)*
  - [x] 移除全局猜测 `errors` / `success: false` / `ok: false` 的默认行为，改为显式 opt-in（`checkBusinessErrors?: boolean | ((data: any) => string | boolean | undefined | null)`)，默认 `false`，彻底避免误伤包含此类字段的正常业务文档。
  - [x] 支持端点级判别器与自定义函数判别器。
- [x] **12.2 超时错误规范化与请求上下文保留 (`packages/dashin/src/utils/scripts/request.ts`)** *(2026-09-20)*
  - [x] 统一使用 `isDashinRequestError` 属性标识自身错误，避免与 `umi-request` 内部名为 `RequestError` 的超时错误碰撞。
  - [x] 规范化超时错误，提取 `url`、保留 `status: 504`、提供可读超时信息与 description。
  - [x] 编写专门的 timeout 自动化单元测试并通过。
- [x] **12.3 `getResponse: true` 业务错误检测与网络错误 URL 保留** *(2026-09-20)*
  - [x] 在 `request.use` 中解包 `{ data, response }`，确保开启 `getResponse: true` 时依然能检测业务错误，并将真实的 `response` 保存在 `RequestError` 中。
  - [x] 提取网络错误下的 `url`（`error.request?.url || error.config?.url` 等）。
  - [x] 编写 `getResponse: true` 与业务错误检测组合的单元测试（`request.test.ts` 12 个测试全部通过）。
- [x] **12.4 D1 数据源严格变异契约与错误冒泡 (`packages/dashin-source-d1`)** *(2026-09-20)*
  - [x] 重构 `services/crud.ts`（`addSer`, `updateSer`, `deleteSer`）：检测到 `res.error` 时必须抛出 `Error`，禁止通过 resolve 返回导致抽屉误关闭。
  - [x] 重构 `services/bulk.ts`（`bulkDeleteSer`, `bulkUpdateSer`）：当 `fail > 0` 时抛出异常，不再按成功 resolve。
  - [x] 编写 D1 CRUD 与 Bulk 服务错误拒绝的单元测试（24 个测试全部通过）。
- [x] **12.5 批量变异操作严格失败语义 (`packages/dashin-source-payload` & `source-d1`)** *(2026-09-20)*
  - [x] 修复 `packages/dashin-source-payload/services/bulk.ts` 与 `source-d1/services/bulk.ts`：只要 `fail > 0`（包括部分失败）就必须 reject，精准统计成功与失败数量，保留未成功项以便重试。
  - [x] 编写部分失败 reject 且携带详细统计信息的测试，Payload 与 D1 全部通过。
- [x] **12.6 HTTP 204 No Content / 空响应合法性保证** *(2026-09-20)*
  - [x] 修复 `packages/dashin-source-payload/services/crud.ts` 的 `assertPayloadSuccess`：放行 `null`/`undefined` 空响应（204 No Content），避免合法删除被误判为失败。
  - [x] 编写 204 空响应测试并通过。
- [x] **12.7 Table 组件编辑路径统一契约与错误横幅 (`packages/dashin/src/components/Table`)** *(2026-09-20)*
  - [x] 重构 `Table/index.tsx` 中的 `save()` 与 `remove()`：引入 try/catch，失败时保持编辑行打开，渲染 `role="alert"` 与 `aria-live="assertive"` 错误横幅。
  - [x] 行内编辑增加 `Column.required` 与 `Column.validate` 客户端校验；数值输入清空时保留 `""`。
  - [x] 编写 `Table` 行内编辑与删除失败保留、错误横幅渲染与校验测试（11 个测试全部通过）。
- [x] **12.8 补齐边界用例与 Demo 配置** *(2026-09-20)*
  - [x] 覆盖测试：正常业务文档字段碰撞（包含 errors 或 ok:false 字段不被误判）、`ok: false` 与 `success: false` 独立用例、create handler rejection。
  - [x] 检查并规范 Demo 实体所有必填列的 `required` 配置（customers, orders, products, categories）。
  - [x] 消除 `git diff --check` 中的尾部空行错误（0 报错）。
- [x] **12.9 首轮历史门禁快照（已由 12.14/12.16 最终结果取代）** *(2026-09-20)*
  - [x] 全 Monorepo 23 包 `yarn tsc:build` 全部绿灯编译通过（70.51s）。
  - [x] `yarn workspace @dashin-dev/dashin typecheck` 零错误通过。
  - [x] 首轮 `packages/dashin` 核心框架单测 26 个测试套件、166 项单测通过；最终结果见 12.14（175 项）。
  - [x] 首轮 `packages/dashin-source-payload` 36 项、`packages/dashin-source-d1` 24 项通过；最终结果见 12.14/12.16（40/27 项）。
  - [x] 文档站点 `npm run build --prefix docs` 10.46s 编译成功并通过。
  - [x] 遵循返工原则：在用户正式合并与发布前，暂不标记全流程完结，不建议家赞管理后台（jiazan-admin）在此刻提前移除防护层。
- [x] **12.10 Table 批量异步变异契约返工** *(2026-09-20 独立复核；Table 16 项测试通过)*
  - [x] 自定义批量 action 必须 await；成功才清空选择，reject 时展示错误并保留可重试选择；若错误携带可映射的 `resList`，只保留失败项。
  - [x] 内置 bulk delete/update 捕获 rejection，失败不清选择、不 reload，成功才清选择并 reload。
  - [x] `Action.onClick` 类型支持 `void | Promise<void>`，Table 测试覆盖成功、reject、部分失败重试和内置 delete/update reject。
- [x] **12.11 Request 判别器与 response/URL 精确契约** *(2026-09-20 独立复核；request 16 项测试通过)*
  - [x] 明确并实现 `string/true = 检测到失败`、`false/undefined/null = 无错误`，四类返回值均有测试。
  - [x] 业务错误优先使用 `response.url`；`getResponse: true` 测试精确断言 response 对象身份与最终 URL。
- [x] **12.12 D1 批量 transport failure 逐项统计** *(2026-09-20 独立复核；D1 bulk 8 项测试通过)*
  - [x] bulk delete/update 对每项 execute throw 逐项捕获、继续执行、汇总 notice 并在失败时携带计数和 `resList` reject。
  - [x] delete/update 分别覆盖全成功、部分失败、全部失败与 transport throw，并验证计数、`resList`、severity 和 rejection。
- [x] **12.13 模板生产冒烟可靠性返工** *(2026-09-20 独立复核；最终脚本连续两次通过)*
  - [x] 使用动态空闲端口和本次临时模板唯一标记，服务启动早退立即失败，避免旧服务造成假阳性。
  - [x] Windows 可靠终止完整 preview 进程树；清理后断言端口释放和临时目录删除。
  - [x] template smoke 连续两次通过（动态端口 61977、61082），第二次无残留进程、端口冲突或旧页面误判。
- [x] **12.14 Node 20 干净安装与全量门禁** *(2026-09-20 独立复核)*
  - [x] 修复平台绑定直接依赖和 lockfile/Babel helper；Windows Node 20.20.2 隔离依赖树 `yarn install --frozen-lockfile` 成功，并验证仅安装 Windows 平台包。
  - [x] `yarn tsc:build`（23 包）、Dashin typecheck、Dashin/Payload/D1 三组完整单测（175/40/27）、文档构建与 `git diff --check` 全绿。
  - [x] Playwright E2E 为 6 passed / 3 skipped / 0 failed；最终版 template smoke 连续两次通过且无残留端口/进程。
- [x] **12.15 最终交付清理与状态核对** *(2026-09-20 独立复核)*
  - [x] `TODO.md` 与实际门禁一致；Playwright、template smoke 与 clean-install 临时产物均已清理。
  - [x] 该轮交接时保持未提交、未发布，未升级家赞依赖、未删除家赞下游防御层；后续提交由 12.17 的明确授权完成。
- [x] **12.16 Payload bulk 完整验收矩阵补测** *(2026-09-20 最终交叉核对新增；Payload 40 项测试通过)*
  - [x] Payload delete/update 分别显式覆盖全成功、部分失败、全部失败和 transport throw。
  - [x] 各路径验证计数、`resList`、notice severity、继续处理剩余项与最终 rejection；Payload 全套测试重跑通过。
- [x] **12.17 文档收尾与提交前准备** *(2026-09-20)*
  - [x] 统一首轮历史测试数字与最终结果，公开文档说明严格变异契约、自定义异步 action 与部分失败重试语义。
  - [x] 新增 `2.0.0-alpha.8` 迁移说明并接入 VitePress 导航；VitePress 构建通过。
  - [x] 审计公共导出、依赖/lockfile、GitHub Actions Node 20/Linux 配置和无关产物；构建/test-results 等门禁产物已清理。
  - [x] Node 20.20.2 Windows 全部门禁通过；WSL2 Ubuntu 隔离验证 frozen install、23 包构建、typecheck、175/40/27 单测、文档、Playwright 6/3/0 与两次 template smoke 全绿。分支未推送，因此 GitHub 手动 CI 未触发。
  - [x] 按 fix/test/docs 创建三个聚焦提交；保持未推送、未合并、未发布，家赞防御层不变。

---

### Phase 13: `smol-toml` 构建工具链 DoS 安全修复 (已完成)
- [x] **13.1 公告与依赖链核验** *(2026-09-20)*
  - [x] 确认 GHSA-7w5x-hrqm-74c2 影响 `smol-toml <=1.7.0`，最低修复版本为 `1.7.1`。
  - [x] 确认当前链路为 `lerna@9.0.7 -> nx@22.7.5 -> smol-toml@1.6.1`，属于构建工具链依赖。
- [x] **13.2 最小依赖修复** *(2026-09-20)*
  - [x] 通过 Yarn 1 `resolutions` 将 `smol-toml` 固定到最低安全版本 `1.7.1`；lockfile 仅替换对应单一条目。
  - [x] `yarn why` 与已安装元数据均确认只解析到 `1.7.1`；正常/恶意 TOML 解析冒烟及 frozen install 通过。
- [x] **13.3 完整回归门禁** *(2026-09-20)*
  - [x] Node 20.20.2 frozen install、23 包构建、Dashin typecheck 与生产 Vite build 通过。
  - [x] Dashin/Payload/D1 单测（175/40/27）、Playwright E2E（6 passed / 3 expected skipped）与 template smoke 连续两次通过。
  - [x] 首次 template smoke 在生产构建成功后遇到一次瞬时 `networkidle` 超时；未扩大本安全 PR，随后从第一次重新连续两次通过（动态端口 49659、55225）。
  - [x] 文档构建、`smol-toml` 解析/审计、`git diff --check` 与产物清理通过，无测试或 smoke 临时目录残留。
- [x] **13.4 独立安全 PR 与远端检查** *(2026-09-20)*
  - [x] 创建聚焦提交并推送独立分支，PR #166 不包含 Phase 12 或家赞改动。
  - [x] PR #166 以 merge commit `87645e7bf3834689cbb9a740d9a925c13bc1d5ff` 合入 master；GitHub CI、Cloudflare Pages、Workers Builds 与两个 Dependabot checks 全绿。
  - [x] Dependabot #462 自动重评估为 `fixed`（`dismissed_at=null`）；未发布 npm、未打 tag、未升级家赞依赖，安全修复分支继续保留。

---

### Phase 14: `2.0.0-alpha.8` 发布候选准备 (已完成；等待所有者发布授权)
- [x] **14.1 建立独立发布分支与计划** *(2026-09-20)*
  - [x] 从最新 `master` (`87645e7bf3834689cbb9a740d9a925c13bc1d5ff`) 创建 `release/2.0.0-alpha.8`。
  - [x] 新建 `RELEASE_PLAN_ALPHA_8.md`，明确版本范围、门禁、pack 审计与发布授权边界。
- [x] **14.2 同步发布版本** *(2026-09-20)*
  - [x] 将 `lerna.json` 与 23 个可发布 `@dashin-dev/*` 包的版本统一为 `2.0.0-alpha.8`。
  - [x] 将 3 个 CLI 模板中的 9 个 `@dashin-dev/*` 依赖统一为 `^2.0.0-alpha.8`。
  - [x] 审核 lockfile、内部依赖和变更范围；`yarn.lock` 无变化，未升级家赞或无关依赖。
- [x] **14.3 发布提交门禁** *(2026-09-20；候选提交前首轮)*
  - [x] Node 20.20.2 / Yarn 1.22.22 frozen install、23 包构建、Dashin typecheck 与生产构建通过。
  - [x] Dashin/Payload/D1 全套单测（175/40/27）与 Playwright E2E（6 passed / 3 expected skipped）通过。
  - [x] 文档构建、template smoke 连续两次（动态端口 52519、62166）与 `git diff --check` 通过；最终候选 SHA 将再次执行同套门禁。
- [x] **14.4 npm pack 内容审计** *(2026-09-20)*
  - [x] 对 23 个发布包执行 `npm pack --dry-run --json`，确认 package/version、入口文件、类型声明与必要资源齐全（共 1,019 个文件，约 2.22 MiB unpacked）。
  - [x] 修正 `@dashin-dev/field-blocks` manifest 的 JS/类型入口，使其指向实际打包的 `lib/src/index.*`。
  - [x] 从 `@dashin-dev/cli` tarball 排除编译后的 AI 测试，同时保留三个模板必需的 `.env.example`。
  - [x] 确认 tarball 不包含测试产物、临时目录、录屏、敏感配置或其他无关文件。
- [x] **14.5 发布候选交付** *(2026-09-20)*
  - [x] 推送 `release/2.0.0-alpha.8` 候选提交 `b0f3dd07f063e18c0fdbec520e1b8f6b4b4cda50`；GitHub CI Run 35554907501 的 build-test、e2e、template-smoke 与 Cloudflare Pages、Workers Builds 全部成功。
  - [x] 未执行 npm publish，未创建 npm/Git tag，未升级家赞依赖或删除其首轮防御层；后续发布仍需所有者再次明确授权。
