import { TFunction } from "i18next"

import Columns from "./columns"

export const SchemaName = "blogs"

export const SchemaLabel = "Posts"

export const SchemaColumns = Columns

export const ENUM_STATUS: any = (t: TFunction) => {
  return {
    Draft: t("Draft"),
    Pending: t("Pending"),
    Rejected: t("Rejected"),
    Published: t("Published")
  }
}
