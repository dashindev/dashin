import { RxDatabase } from "rxdb"
import { MenuType, SchemaType, SettingType } from "@/core"

export type DocsData = SchemaType | MenuType | SettingType

type collection = "bunadmin_setting" | "bunadmin_menu" | "bunadmin_schema"

interface Props {
  db: RxDatabase<any>
  collection: string | collection
  docsData: DocsData[]
}

export default async function initDocsData({
  db,
  collection,
  docsData
}: Props) {
  await db[collection].bulkInsert(docsData)
}
