import { IPluginData } from "@xbuilder/bunadmin"

export { default as post } from "./local"

const shared = {
  team: "myteam",
  group: "myblog",
  customized: true
}

export const initData: IPluginData[] = [
  {
    ...shared,
    id: "myteam_myblog_local",
    name: "local",
    label: "Local",
    icon_type: "eva",
    icon: "file-text-outline"
  },
  {
    ...shared,
    id: "myteam_myblog_remote",
    name: "remote",
    label: "Remote",
    icon_type: "eva",
    icon: "file-text-outline"
  }
]
