import { request } from "@dashin-dev/dashin"
import type { CollectionEntry, CollectionMeta, Column, CrudTableProps, Query } from "@dashin-dev/dashin"
import dataCtrl from "./controllers/dataCtrl"
import editableCtrl from "./controllers/editableCtrl"
import { apiBase, apiPath, plHeaders } from "./services/plConfig"

type TFn = (key: string) => string

/**
 * Wire a Payload collection into core's `<CrudTable>` — returns its `data` +
 * `editable` props (spread them in). Bulk actions still need the table ref, so
 * pass any `actions` to `<CrudTable>` yourself.
 *
 *   const crud = payloadCrud("clients", { t })
 *   <CrudTable title="Clients" columns={columns} {...crud} />
 */
export function payloadCrud<T extends object = any>(
  schema: string,
  opts: { t: TFn; disableAdd?: boolean; searchField?: string }
): Pick<CrudTableProps<T>, "data" | "editable"> {
  const { t, disableAdd, searchField } = opts
  return {
    data: (query: Query<T>) => dataCtrl<T>({ t, tableQuery: query, path: schema, searchField } as any),
    editable: editableCtrl({ t, SchemaName: schema, disableAdd }) as any
  }
}

/**
 * Wire a Payload collection into core's related-preview registry — returns a
 * `CollectionEntry` with a depth-`fetch` (resolve one record by id) + `editable`
 * (CRUD for the nested edit). Supply the display `meta` and the edit-form
 * `columns`; `depth` defaults to 2 so one-hop relations populate for drill-in.
 *
 *   <RelatedPreviewProvider collections={{
 *     clients:   payloadCollection("clients",   { meta: clientMeta,   columns: clientColumns,   t }),
 *     contracts: payloadCollection("contracts", { meta: contractMeta, columns: contractColumns, t })
 *   }}>…</RelatedPreviewProvider>
 */
export function payloadCollection(
  slug: string,
  opts: { meta: CollectionMeta; columns?: Column<any>[]; t: TFn; depth?: number }
): CollectionEntry {
  const { meta, columns, t, depth = 2 } = opts
  return {
    meta,
    columns,
    fetch: async (id: string | number) =>
      await request(apiPath(slug, String(id)), {
        params: { depth },
        prefix: apiBase(),
        method: "GET",
        headers: await plHeaders()
      }),
    editable: editableCtrl({ t, SchemaName: slug }) as any
  }
}
