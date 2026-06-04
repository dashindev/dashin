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
export { default as StatBand } from "./regions/StatBand"
export { default as SidebarFooter } from "./regions/SidebarFooter"
export type { Stat } from "./regions/StatBand"
export { default as EvaIcon } from "./EvaIcon"
export type { EvaIconProps } from "./EvaIcon"

// Token-driven UI primitives
export { default as Button } from "./ui/Button"
export type { ButtonProps } from "./ui/Button"
export { default as Input } from "./ui/Input"
export type { InputProps } from "./ui/Input"
export { default as Select } from "./ui/Select"
export type { SelectProps } from "./ui/Select"
export { default as Card } from "./ui/Card"
export type { CardProps } from "./ui/Card"
export { default as Badge } from "./ui/Badge"
export type { BadgeProps } from "./ui/Badge"
export { default as Avatar } from "./ui/Avatar"
export type { AvatarProps } from "./ui/Avatar"
export { default as Modal } from "./ui/Modal"
export type { ModalProps } from "./ui/Modal"
export { default as Tabs } from "./ui/Tabs"
export type { TabsProps, Tab } from "./ui/Tabs"
export { default as Toggle } from "./ui/Toggle"
export type { ToggleProps } from "./ui/Toggle"
export { default as Tooltip } from "./ui/Tooltip"
export type { TooltipProps } from "./ui/Tooltip"
export { default as Dropdown } from "./ui/Dropdown"
export type { DropdownProps, DropdownItem } from "./ui/Dropdown"
export { default as Textarea } from "./ui/Textarea"
export type { TextareaProps } from "./ui/Textarea"
export { default as Label } from "./ui/Label"
export type { LabelProps } from "./ui/Label"

export interface DefaultLayoutProps {
  children?: any
  leftMenu?: LeftMenuProps
  /** Layout selection + opt-in regions (see utils/themes/layouts). */
  layout?: import("@/utils/themes/layouts").LayoutConfig
  /** KPI cards for the optional stat band (layout.statBand). */
  stats?: import("./regions/StatBand").Stat[]
  /** Data for the sidebar footer slot (layout.sidebarFooter). */
  sidebarStats?: import("./regions/StatBand").Stat[]
  sidebarUpgrade?: import("./regions/SidebarFooter").SidebarFooterProps["upgrade"]
}

export interface ErrorProps {
  statusCode: number
  hasLayout: boolean
  message?: string
  redirect?: string
}
