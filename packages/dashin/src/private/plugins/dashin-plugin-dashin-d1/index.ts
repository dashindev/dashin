import { IPluginData } from "@dashin-dev/dashin"

// A demo plugin backed by Cloudflare D1 via @dashin-dev/source-d1.
// Point VITE_MAIN_URL at the d1-demo-api Worker to see live data.
export { default as posts } from "./posts"
export { default as products } from "./products"

const shared = {
  team: "dashin",
  group: "d1",
  customized: true
}

export const initData: IPluginData[] = [
  {
    ...shared,
    id: "dashin_d1",
    name: "dashin_d1",
    label: "Cloudflare D1",
    icon_type: "eva",
    icon: "cloud-upload-outline",
    ignore_schema: true
  },
  {
    ...shared,
    id: "dashin_d1_posts",
    name: "posts",
    label: "Posts",
    icon_type: "eva",
    icon: "file-text-outline",
    parent: "dashin_d1"
  },
  {
    ...shared,
    id: "dashin_d1_products",
    name: "products",
    label: "Products",
    icon_type: "eva",
    icon: "shopping-bag-outline",
    parent: "dashin_d1"
  }
]
