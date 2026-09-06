# Dashin & Atomo 融合工程 TODO 追踪清单

> **开发规范声明**：根据 `AGENTS.md` 中的【TODO 驱动开发规范】，所有新功能、重构与跨系统集成必须以本文档为唯一进度跟踪源。
> **原则**：细粒度拆解、**每实现一项立即勾选对应 TODO**、勾选前必须通过编译和测试验证。

---

## 📊 总体实施里程碑与进度概览

- [x] **Phase 0: 深度调研、架构论证与规范确立** (已完成)
- [x] **Phase 1: 契约连接器与鉴权层 (`@dashin-dev/source-atomo` & `@dashin-dev/auth-atomo`)** (已完成)
- [x] **Phase 2: Dashin 运行时动态 Schema 引擎 (Dynamic Schema Engine)** (已完成)
- [ ] **Phase 3: 关系穿透升维与一致性策略 (`RelatedPreview` 集成)** (待开始)
- [ ] **Phase 4: Atomo 高阶资产吸收与插件化 (BlocksEditor, Observability, Workflows)** (待开始)
- [ ] **Phase 5: 全栈脚手架闭环、E2E 测试与生态平替** (待开始)

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

### Phase 3: 关系穿透升维与一致性策略 (`RelatedPreview` 集成)
- [ ] **3.1 关系元数据注册器 (`CollectionRegistryBuilder`)**
  - [ ] 解析 Atomo Schema 中的 `relationships`（多对一、一对多）。
  - [ ] 自动构建 Dashin `RelatedPreviewProvider` 所需的 `CollectionRegistry` 字典。
- [ ] **3.2 字段级关系渲染与层叠抽屉穿透**
  - [ ] 在 `atomoFieldsToDashinColumns` 中，对关系字段注入 `renderDetail: (row) => <RelatedCard slug={targetModel} value={row[foreignKey]} />`。
  - [ ] 测试跨实体级联钻取（如 Contact -> Company -> Deals），验证防环死循环保护（Loop Guard）与面包屑。
- [ ] **3.3 CQRS 读模型一致性体验调优 (Read-Your-Own-Writes)**
  - [ ] 在 `editableCtrl.onRowUpdate` / `onRowAdd` 成功后，加入短时乐观更新或带重试的拉取机制，规避 Atomo 异步投影延迟带来的闪烁。

---

### Phase 4: Atomo 高阶资产吸收与插件化 (Blocks, Observability, Workflows)
- [ ] **4.1 拖拽式块编辑器插件 (`@dashin-dev/field-blocks`)**
  - [ ] 将 `atomo-admin-ui` 中的 `EnhancedBlocksEditor`、`BlocksEditor`、`DragDropHelpers` 提取并重构。
  - [ ] 适配 Dashin Tailwind 设计 Token 与深浅主题。
  - [ ] 作为自定义表单组件注册到 Dashin 的 `DetailDrawer` 中，支持 JSON Blocks 字段渲染。
- [ ] **4.2 Atomo 事件与投影器运维面板插件 (`@dashin-dev/plugin-atomo-observability`)**
  - [ ] 移植 `ObservabilityView`，重构为符合 Dashin 风格的数据卡片与健康指标图表。
  - [ ] 对接 Atomo `/api/projectors` 与指标接口，展示事件延迟、处理吞吐量，并提供一键触发 Replay 操作。
- [ ] **4.3 Atomo 工作流设计器插件 (`@dashin-dev/plugin-atomo-workflows`)**
  - [ ] 移植 `WorkflowDesigner` 与 `WorkflowGraphView`，重构为 Dashin 插件页面。
  - [ ] 适配 Atomo 的 Actions 声明式状态机，实现可视化节点拖拽与事件链路配置。

---

### Phase 5: 全栈脚手架闭环、E2E 测试与生态平替
- [ ] **5.1 全栈集成与 E2E 冒烟测试**
  - [ ] 编写 Playwright E2E 自动化测试用例，覆盖：Atomo CRM 模型加载 -> 动态列表展示 -> 新建/更新记录 -> 关联钻取 -> 投影器健康检查。
- [ ] **5.2 打造全栈脚手架模板 (`dashin-cli/templates/fullstack-atomo`)**
  - [ ] 在 `dashin-cli` 中新增全栈模板，包含 `docker-compose.yml`（Atomo Rust 核心 + Postgres + Dashin Vite 前端）。
  - [ ] 支持一键命令 `dashin new my-app --template atomo` 初始化全栈项目。
- [ ] **5.3 官方生态整合与 `atomo-admin-ui` 平滑平替**
  - [ ] 更新 `atomo` 根目录的开发指引与文档，推荐 Dashin 作为官方首选生产级 Admin UI。
  - [ ] 整理迁移指南，确保既有 Atomo 用户能够平滑切换到 Dashin，淘汰旧有简易 UI。
