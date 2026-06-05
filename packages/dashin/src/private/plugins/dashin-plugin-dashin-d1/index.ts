import { IPluginData } from "@dashin-dev/dashin"

// The Dashin Store demo — an e-commerce admin backed by Cloudflare D1 via
// @dashin-dev/source-d1. Point VITE_MAIN_URL at the d1-demo-api Worker for live
// data. Two grouped sections: Catalog (Products, Categories) and Sales (Orders,
// Customers). All resources route under dashin-plugin-dashin-d1/<name>.
export { default as products } from "./products"
export { default as categories } from "./categories"
export { default as orders } from "./orders"
export { default as customers } from "./customers"

const shared = {
  team: "dashin",
  group: "d1",
  customized: true
}

export const initData: IPluginData[] = [
  // ── Catalog ──────────────────────────────────────────────
  {
    ...shared,
    id: "dashin_d1_catalog",
    name: "dashin_d1_catalog",
    label: "Catalog",
    icon_type: "eva",
    icon: "cube-outline",
    ignore_schema: true
  },
  {
    ...shared,
    id: "dashin_d1_products",
    name: "products",
    label: "Products",
    icon_type: "eva",
    icon: "pricetags-outline",
    parent: "dashin_d1_catalog"
  },
  {
    ...shared,
    id: "dashin_d1_categories",
    name: "categories",
    label: "Categories",
    icon_type: "eva",
    icon: "folder-outline",
    parent: "dashin_d1_catalog"
  },
  // ── Sales ────────────────────────────────────────────────
  {
    ...shared,
    id: "dashin_d1_sales",
    name: "dashin_d1_sales",
    label: "Sales",
    icon_type: "eva",
    icon: "shopping-cart-outline",
    ignore_schema: true
  },
  {
    ...shared,
    id: "dashin_d1_orders",
    name: "orders",
    label: "Orders",
    icon_type: "eva",
    icon: "shopping-bag-outline",
    parent: "dashin_d1_sales"
  },
  {
    ...shared,
    id: "dashin_d1_customers",
    name: "customers",
    label: "Customers",
    icon_type: "eva",
    icon: "people-outline",
    parent: "dashin_d1_sales"
  }
]
