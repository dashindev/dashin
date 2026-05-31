/**
 * Worked example: a `posts` page backed by PocketBase via
 * @xbuilder/bunadmin-source-pocketbase.
 *
 * Drop this into a bunadmin project's plugin (e.g. src/plugins/bunadmin-plugin-
 * myteam-blog/posts/index.tsx) and register it like any other schema plugin.
 * Requires a PocketBase `posts` collection (see docs/pocketbase/seed.js).
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
import { dataCtrl, editableCtrl } from "@xbuilder/bunadmin-source-pocketbase"

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
  { title: t("Views"), field: "views", type: "numeric" }
]

export default function Posts() {
  const { t } = useTranslation("table")
  const tableRef = createRef()
  const SchemaName = "posts" // PocketBase collection name

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
        // Remote data via PocketBase
        data={query => dataCtrl({ t, tableQuery: query, path: SchemaName })}
        // Inline create / update / delete via PocketBase
        editable={editableCtrl({ t, SchemaName })}
      />
    </>
  )
}
