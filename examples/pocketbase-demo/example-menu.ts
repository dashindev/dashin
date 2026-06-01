/**
 * Flagship plugin registration — turns the two schema pages (`posts`,
 * `products`) into a **multi-level menu**: a "Blog" parent with Posts and
 * Products children. `ignore_schema: true` makes the parent a menu group only.
 *
 * Drop into src/plugins/bunadmin-plugin-xbuilder-blog/index.ts.
 */
import { IPluginData } from "@xbuilder/bunadmin"

export { default as posts } from "./example-admin"
export { default as products } from "./example-products"

const shared = { team: "xbuilder", group: "blog", customized: true }

export const initData: IPluginData[] = [
  {
    ...shared,
    id: "xbuilder_blog",
    name: "xbuilder_blog",
    label: "Blog",
    icon_type: "eva",
    icon: "file-text-outline",
    ignore_schema: true // parent → menu group only
  },
  {
    ...shared,
    id: "xbuilder_blog_posts",
    name: "posts",
    label: "Posts",
    icon_type: "eva",
    icon: "file-text-outline",
    parent: "xbuilder_blog"
  },
  {
    ...shared,
    id: "xbuilder_blog_products",
    name: "products",
    label: "Products",
    icon_type: "eva",
    icon: "shopping-bag-outline",
    parent: "xbuilder_blog"
  }
]
