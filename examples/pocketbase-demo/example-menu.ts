/**
 * Flagship plugin registration — turns the two schema pages (`posts`,
 * `products`) into a **multi-level menu**: a "Blog" parent with Posts and
 * Products children. `ignore_schema: true` makes the parent a menu group only.
 *
 * Drop into src/plugins/dashin-plugin-dashin-blog/index.ts.
 */
import { IPluginData } from "@dashin-dev/dashin"

export { default as posts } from "./example-admin"
export { default as products } from "./example-products"

const shared = { team: "dashin", group: "blog", customized: true }

export const initData: IPluginData[] = [
  {
    ...shared,
    id: "dashin_blog",
    name: "dashin_blog",
    label: "Blog",
    icon_type: "eva",
    icon: "file-text-outline",
    ignore_schema: true // parent → menu group only
  },
  {
    ...shared,
    id: "dashin_blog_posts",
    name: "posts",
    label: "Posts",
    icon_type: "eva",
    icon: "file-text-outline",
    parent: "dashin_blog"
  },
  {
    ...shared,
    id: "dashin_blog_products",
    name: "products",
    label: "Products",
    icon_type: "eva",
    icon: "shopping-bag-outline",
    parent: "dashin_blog"
  }
]
