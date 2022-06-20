import { DrawerProps as IDrawerProps } from "./Drawer"
import { LeftMenuProps } from "./LeftMenu"

export { default as AnimatedRandomBG } from "./AnimationBackground"
export { default as CubeSpinner } from "./CubeSpinner"
export { default as ConfirmDialog } from "./Dialog/ConfirmDialog"
export { default as UploadConfirmDialog } from "./Dialog/UploadCustomDialog"
export { default as Drawer } from "./Drawer"
export type DrawerProps = IDrawerProps

export { default as SchemaContainer } from "./SchemaContainer"
export { default as columnsController } from "./SchemaContainer/controllers/columnsController"
export { default as dataController } from "./SchemaContainer/controllers/dataController"
export * from "./SchemaContainer/controllers/editableController"

export * from "./Selector"
export { default as Snackbar } from "./Snackbar"
export { default as SnackMessage } from "./Snackbar/Message"

export { default as Table, TableHead } from "./Table"
export { default as TableSkeleton } from "./Table/components/TableSkeleton"

export { TableDefaultProps } from "./Table/models/defaultProps"
export * from "./Table/models/types"
export { default as tableIcons } from "./Table/models/tableIcons"

export * from "./FileExplorer"

export { default as BunField } from "./Formik/BunField"
export { default as Repeater } from "./Repeater"
export { default as CoreContainer } from "./CoreContainer"
export { default as ProTip } from "./ProTip"

export { default as LeftMenu } from "./LeftMenu"
export { default as NestedList } from "./NestedMenu"
export { default as TopBar } from "./TopBar"

export interface DefaultLayoutProps {
  children?: any
  leftMenu?: LeftMenuProps
}

export interface ErrorProps {
  statusCode: number
  hasLayout: boolean
  message?: string
  redirect?: string
}
