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
- [x] **Phase 7: downstream 本地测试与生产部署验证 (方案二: 容器挂载联调)** (已完成)

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

### Phase 7: downstream 本地测试与生产部署验证 (方案二: 容器挂载联调) (In Progress)
- [x] **7.1 准备与构建 Admin UI 静态产物** *(2026-09-06)*
  - 确认/构建基于 base `/admin/` 的静态 SPA 产物（产物位于 `atomo/packages/atomo-admin-ui/dist`），`tsc && vite build --base=/admin/` 构建成功（8.45s）。
- [x] **7.2 配置 downstream 本地 Docker Compose 挂载** *(2026-09-06)*
  - 在 `downstream/backend/docker-compose.yml` 中挂载 `../../atomo/packages/atomo-admin-ui/dist:/app/admin:ro` 并显式配置 `ATOMO_ADMIN_DIR: /app/admin`。
- [x] **7.3 启动本地后端并执行容器服务冒烟** *(2026-09-06)*
  - 启动 `downstream/backend` 的 `db`、`server`、`migrate` 容器成功（服务端口根据 `.env` 映射至 60503）。
  - 验证 `http://localhost:60503/meta/schema` 成功返回 downstream 6 个核心模型（`CreditLedger`, `GenerationJob`, `Subscription`, `TrialUsage`, `UsageEvent`, `CreditBalance`）。
- [x] **7.4 验证 Admin UI 静态伺服与子路径路由** *(2026-09-06)*
  - HTTP 请求验证 `http://localhost:60503/admin/` 正常返回 200 与 `index.html`。
  - 验证静态资源（`/admin/assets/index-60938748.css` 和 `/admin/assets/index-0f4acdda.js`）正确返回 200。
  - 验证 SPA 回退路由（如 `/admin/entities/GenerationJob`）正常回退至 `index.html`，状态码 200，无 404。
- [x] **7.5 模拟管理员鉴权与 downstream 核心模型数据联调** *(2026-09-06)*
  - 验证使用管理员凭据成功通过 `/auth/login` 获取真实 JWT Token，并通过 `/auth/me` 校验 Admin 身份。
  - 通过 GraphQL `paginatedRecords` 成功内省与拉取 downstream 真实业务数据（`GenerationJob` 2 条，`CreditLedger` 8 条）。
  - 验证 `CreditLedger` 的只读防篡改机制：触发 delete mutation 被后端严格拦截返回 `Access denied for 'delete' on 'CreditLedger'`，与 Dashin 前端权限规则完全匹配。
- [x] **7.6 整理测试结果与上线部署操作规程** *(2026-09-06)*
  - 汇总测试结果、日志证据与验证结论，确认容器单端口静态托管、SPA 回退路由、JWT 鉴权及模型数据读写权限全部通过。
  - 输出基于 Watchtower 自动拉取与 Portainer 的生产环境标准上线规程。
