import { IPluginData } from "@xbuilder/bunadmin"

const plugin = "auth-pocketbase"

const data: IPluginData[] = [
  {
    id: "bunadmin_auth_pocketbase_sign_in",
    group: "auth-pocketbase",
    name: "sign-in",
    label: "Sign-in",
    team: "bunadmin",
    customized: true,
    ignore_menu: true
  }
]

export default { plugin, data }
