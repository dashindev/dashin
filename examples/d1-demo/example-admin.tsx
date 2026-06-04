/**
 * Worked example: a `posts` page backed by Cloudflare D1 (serverless SQLite)
 * via @dashin-dev/source-d1.
 *
 * D1 isn't directly reachable from the browser, so the connector talks to a
 * tiny gateway Worker (workers/d1-demo-api) that runs the SQL on D1:
 *   browser (source-d1) -> POST {worker}/query -> D1
 *
 * Drop this into a dashin project's plugin and register it like any other
 * schema plugin. Requires a `posts` table (see workers/d1-demo-api/schema.sql)
 * and `VITE_MAIN_URL` pointed at the Worker.
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
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-d1"

const theme = { dashin: { iconColor: "#8f9bb3" } }

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
  const SchemaName = "posts" // D1 table name

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
        data={query =>
          dataCtrl({ t, tableQuery: query, path: SchemaName, searchField: "title" })
        }
        editable={editableCtrl({ t, SchemaName })}
        actions={[bulkDeleteCtrl({ SchemaName, t, tableRef })]}
      />
    </>
  )
}
