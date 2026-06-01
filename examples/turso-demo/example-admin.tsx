/**
 * Worked example: a `posts` page backed by Turso / libSQL (SQL over HTTP) via
 * @xbuilder/bunadmin-source-turso.
 *
 * Drop this into a bunadmin project's plugin and register it like any other
 * schema plugin. Requires a `posts` table (see start.sh seed step).
 */
import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps,
  useTranslation,
  Column
} from "@xbuilder/bunadmin"
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@xbuilder/bunadmin-source-turso"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

interface Post {
  id: number
  title: string
  status: string
  views: number
}

const columns = ({ t }: { t: any }): Column<Post>[] => [
  { title: t("Id"), field: "id", editable: "never", width: 100 },
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
  const SchemaName = "posts" // libSQL table name

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
