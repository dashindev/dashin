/**
 * Worked example: a `posts` page backed by Appwrite Databases via
 * @dashin-dev/source-appwrite.
 *
 * Drop this into a dashin project's plugin and register it like any other
 * schema plugin. Requires an Appwrite `posts` collection (see README.md).
 * Note: Appwrite rows use `$id` rather than `id`.
 */
import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps,
  useTranslation,
  Column
} from "@dashin-dev/dashin"
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-appwrite"

const theme = { dashin: { iconColor: "#8f9bb3" } }

interface Post {
  $id: string
  title: string
  status: string
  views: number
}

const columns = ({ t }: { t: any }): Column<Post>[] => [
  { title: t("Id"), field: "$id", editable: "never", width: 220 },
  { title: t("Title"), field: "title" },
  {
    title: t("Status"),
    field: "status",
    lookup: { draft: "Draft", published: "Published" }
  },
  { title: t("Views"), field: "views", type: "numeric" }
]

export default function Posts() {
  const { t } = useTranslation("table")
  const tableRef = createRef()
  const SchemaName = "posts" // Appwrite collectionId

  return (
    <>
      <TableHead title="Posts" />
      <Table<Post>
        tableRef={tableRef}
        title="Posts"
        columns={columns({ t })}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{ ...DefaultProps.options, filtering: true }}
        data={query => dataCtrl({ t, tableQuery: query, path: SchemaName })}
        editable={editableCtrl({ t, SchemaName })}
        actions={[bulkDeleteCtrl({ SchemaName, t, tableRef })]}
      />
    </>
  )
}
