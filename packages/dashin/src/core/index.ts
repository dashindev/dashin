import noticeController from "./notice/controllers/noticeController"
import { Type as TypeSchema } from "./schema/types"
import { Type as TypeMenu } from "@/core/menu/types"
import { Type as TypeSetting } from "@/core/setting/types"

export const notice = noticeController

export { Collection as Schema } from "./schema/collections"
export { Collection as Menu } from "@/core/menu/collections"

export const AuthPrimary = "username"

export type SchemaType = TypeSchema
export type MenuType = TypeMenu
export type SettingType = TypeSetting
