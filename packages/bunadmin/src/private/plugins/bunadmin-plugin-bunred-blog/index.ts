import { IPluginData } from "@xbuilder/bunadmin"

export { default as post } from "./post"

const shared = {
  team: "xbuilder",
  group: "blog",
  customized: true
}

export const initData: IPluginData[] = [
  {
    ...shared,
    id: "xbuilder_blog",
    name: "xbuilder_blog",
    label: "Blog",
    icon_type: "eva",
    icon: "file-text-outline",
    ignore_schema: true
  },
  {
    ...shared,
    id: "xbuilder_blog_category",
    name: "category",
    label: "Category",
    icon_type: "eva",
    icon: "file-text-outline",
    parent: "xbuilder_blog"
  },
  {
    ...shared,
    id: "xbuilder_blog_post",
    name: "post",
    label: "Post",
    icon_type: "eva",
    icon: "file-text-outline",
    parent: "xbuilder_blog"
  }
]
