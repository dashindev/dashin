// Browser-only synthetic fixtures: real components + IndexedDB, no live APIs.
import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import Dexie from "dexie"
import Table from "../../src/components/Table"
import CrudTable from "../../src/components/CrudTable"
import DetailDrawer from "../../src/components/DetailDrawer"
import NestedMenu from "../../src/components/NestedMenu"
import { RelatedPreviewProvider, RelatedCard } from "../../src/components/RelatedPreview"
import { completeSignIn } from "../../src/utils/scripts/signIn"
import i18n from "../../src/utils/i18n"
import "../../src/tailwind.css"

const locale = new URLSearchParams(location.search).get("locale") || "en"
document.documentElement.lang = locale
await i18n.changeLanguage(locale)
const db = new Dexie("dashin-reliability-fixture")
db.version(1).stores({ users: "username", settings: "name" })
const users = db.table("users"), settings = db.table("settings")
const columns = ["sku", "name", "description", "warehouse"].map(field => ({ field, title: field, width: 280 }))
const products = [1, 2, 3, 4].map(id => ({ sku: `product-${id}`, name: `Product ${id}`, description: "Long synthetic description ".repeat(8), warehouse: `Warehouse ${id}` }))
const collections: any = { products: {
  meta: { label: "Product", title: (row: any) => row.name },
  fetch: async () => ({ id: "product-2", name: "Related product" }),
  columns: [{ field: "name", title: "name" }],
  editable: { onRowUpdate: async () => { throw new Error("Synthetic nested save failure") } }
} }
const drawerColumns = [...columns, { field: "related", title: "Related", editComponent: () => <RelatedCard slug="products" value={{ id: "product-2", name: "Related product" }} /> }, ...Array.from({ length: 18 }, (_, index) => ({ field: `field-${index}`, title: `Field ${index}` }))]
const getRowId = (row: any) => row.sku
const menu: any[] = [{ name: "catalog", label: "Catalog", parent: "", rank: "1" }, ...Array.from({ length: 18 }, (_, index) => ({ name: `item-${index}`, label: `Item ${index + 1}`, parent: "catalog", slug: `/fixture/item-${index}` }))]
const requests: any[] = [], deletes: string[] = []
const orderData = (query: any) => new Promise<any>((resolve, reject) => requests.push({ query, resolve, reject }))
const api = { requests, deletes, db, users, settings, navigated: 0, deleteFails: true }
const crudApi = { loads: 0, saves: 0 }
;(window as any).crudFixture = crudApi
const crudColumns = [{ field: "number", title: "number" }]
const crudData = async () => { crudApi.loads++; return { data: [{ number: "ORDER-C" }], page: 0, totalCount: 1 } }
const crudEditable = { onRowUpdate: async () => { crudApi.saves++ } }
;(window as any).fixture = api

function Fixture() {
  const [collapsed, setCollapsed] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [scenario, setScenario] = useState("401")
  const [name, setName] = useState("synthetic@example.test")
  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError("")
    await users.clear(); await settings.clear()
    const oldToken = localStorage.getItem("fixture-token")
    await completeSignIn({
      t: ((key: string) => key) as any, db: Object.assign(db, { users, settings }) as any,
      setSubmitting, navigate: () => { api.navigated++ },
      notify: notice => { if (notice.severity === "error") setError(notice.content || notice.title) },
      signIn: async () => {
        if (scenario === "malformed") return { token: "", user: { username: name } }
        if (["401", "403", "network", "timeout"].includes(scenario)) throw Object.assign(new Error(`Synthetic ${scenario}`), { status: Number(scenario) || undefined })
        return { token: "synthetic-token", user: { username: name, role: "reader" } }
      },
      afterPersist: async () => {
        localStorage.setItem("fixture-token", "synthetic-token")
        if (scenario === "storage") throw new Error("Synthetic storage failure")
        if (scenario === "mid-write") await settings.put({ value: "missing primary key" })
      },
      rollbackPersist: () => { if (oldToken == null) localStorage.removeItem("fixture-token"); else localStorage.setItem("fixture-token", oldToken) }
    })
  }
  return <main style={{ padding: 12, maxWidth: "100vw" }}>
    <h1>Reliability — synthetic orders/products</h1>
    <form onSubmit={login} aria-label="Synthetic login">
      <input aria-label="Username" value={name} onChange={e => { setName(e.target.value); setError("") }} />
      <select aria-label="Login scenario" value={scenario} onChange={e => { setScenario(e.target.value); setError("") }}>
        {["401", "403", "network", "timeout", "malformed", "storage", "mid-write", "success"].map(value => <option key={value}>{value}</option>)}
      </select>
      <button disabled={submitting}>Sign in</button>
      {error && <p role="alert">{error}</p>}
    </form>
    <button onClick={() => setCollapsed(value => !value)}>Toggle sidebar</button>
    <nav aria-label="Fixture navigation" style={{ width: collapsed ? 60 : 220 }}><NestedMenu data={menu} collapsed={collapsed} /></nav>
    <section aria-label="Products"><Table title="Products" columns={columns} data={products} getRowId={getRowId}
      options={{ selection: true, pageSize: 2, pageSizeOptions: [2], search: false, minTableWidth: 1200 }}
      editable={{ onRowDelete: async row => { deletes.push(row.sku); if (row.sku === "product-3" && api.deleteFails) throw Object.assign(new Error("Synthetic lock"), { outcome: "failed" }) } }} /></section>
    <section aria-label="Orders"><Table title="Orders" columns={[{ field: "number", title: "number" }]} data={orderData} options={{ filtering: true }} /></section>
    <section aria-label="Order lifecycle"><CrudTable title="Order lifecycle" columns={crudColumns} data={crudData} editable={crudEditable} /></section>
    <button onClick={() => setDrawer(true)}>Open product</button>
    {drawer && <DetailDrawer mode="edit" row={products[0]} columns={drawerColumns}
      onClose={() => setDrawer(false)} editable={{ onRowUpdate: async () => { throw new Error("Synthetic save failure") } }} />}
  </main>
}
createRoot(document.getElementById("root")!).render(<BrowserRouter><RelatedPreviewProvider collections={collections}><Fixture /></RelatedPreviewProvider></BrowserRouter>)
