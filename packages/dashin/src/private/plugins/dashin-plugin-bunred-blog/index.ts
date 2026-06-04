import { IPluginData } from "@dashin-dev/dashin"

export { default as post } from "./post"

const shared = {
  team: "dashin",
  group: "blog",
  customized: true
}

export const initData: IPluginData[] = [
  {
    ...shared,
    id: "dashin_blog",
    name: "dashin_blog",
    label: "Blog",
    icon_type: "eva",
    icon: "file-text-outline",
    ignore_schema: true
  },
  {
    ...shared,
    id: "dashin_blog_category",
    name: "category",
    label: "Category",
    icon_type: "eva",
    icon: "file-text-outline",
    parent: "dashin_blog"
  },
  {
    ...shared,
    id: "dashin_blog_post",
    name: "post",
    label: "Post",
    icon_type: "eva",
    icon: "file-text-outline",
    parent: "dashin_blog"
  }
]
