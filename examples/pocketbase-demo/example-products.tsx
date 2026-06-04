/**
 * Flagship worked example — the `products` schema (second schema of the same
 * plugin). Two schemas under one plugin → a multi-level menu (see
 * `example-menu.ts`). Shows a numeric and a boolean column + bulk delete.
 *
 * Drop into src/plugins/dashin-plugin-dashin-blog/products/index.tsx.
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

const theme = { dashin: { iconColor: "#8f9bb3" } }

interface Product {
  id: string
  name: string
  price: number
  in_stock: boolean
}

const columns = ({ t }: { t: any }): Column<Product>[] => [
  { title: t("Id"), field: "id", editable: "never", width: 180 },
  { title: t("Name"), field: "name" },
  { title: t("Price"), field: "price", type: "numeric" },
  { title: t("In stock"), field: "in_stock", type: "boolean" }
]

export default function Products() {
  const { t } = useTranslation("table")
  const tableRef = createRef()
  const SchemaName = "products" // PocketBase collection name

  return (
    <>
      <TableHead title={t("Products")} />
      <Table<Product>
        tableRef={tableRef}
        title={t("Products")}
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
