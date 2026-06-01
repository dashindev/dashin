/**
 * Flagship worked example — the `posts` schema of a multi-schema PocketBase
 * plugin (paired with `example-products.tsx` + `example-menu.ts`).
 *
 * Demonstrates plugin-level features: filtering/search, inline CRUD, **bulk
 * delete**, a status-pill `lookup`, a numeric column, and a custom `render`.
 *
 * The surrounding shell (KPI stat band, modern layout, dark-mode toggle, i18n)
 * is provided automatically by `bunadmin new` on every list view — no code here.
 *
 * Drop into src/plugins/bunadmin-plugin-xbuilder-blog/posts/index.tsx.
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
import {
  dataCtrl,
  editableCtrl,
  bulkDeleteCtrl
} from "@dashin-dev/source-pocketbase"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

interface Post {
  id: string
  name: string
  status: string
  views: number
}

const columns = ({ t }: { t: any }): Column<Post>[] => [
  { title: t("Id"), field: "id", editable: "never", width: 180 },
  { title: t("Name"), field: "name" },
  {
    title: t("Status"),
    field: "status",
    lookup: { Draft: "Draft", Published: "Published" }
  },
  {
    title: t("Views"),
    field: "views",
    type: "numeric",
    // custom cell renderer — flag popular posts
    render: (row: Post) => (row.views >= 100 ? `🔥 ${row.views}` : row.views)
  }
]

export default function Posts() {
  const { t } = useTranslation("table")
  const tableRef = createRef()
  const SchemaName = "posts" // PocketBase collection name

  return (
    <>
      <TableHead title={t("Posts")} />
      <Table<Post>
        tableRef={tableRef}
        title={t("Posts")}
        columns={columns({ t })}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{ ...DefaultProps.options, filtering: true }}
        // Remote data via PocketBase
        data={query => dataCtrl({ t, tableQuery: query, path: SchemaName })}
        // Inline create / update / delete via PocketBase
        editable={editableCtrl({ t, SchemaName })}
        // Bulk "delete selected" toolbar action
        actions={[bulkDeleteCtrl({ SchemaName, t, tableRef })]}
      />
    </>
  )
}
