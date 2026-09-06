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

