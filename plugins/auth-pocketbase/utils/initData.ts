import { IPluginData } from "@dashin-dev/dashin"

const plugin = "auth-pocketbase"

const data: IPluginData[] = [
  {
    id: "dashin_auth_pocketbase_sign_in",
    group: "auth-pocketbase",
    name: "sign-in",
    label: "Sign-in",
    team: "dashin",
    customized: true,
    ignore_menu: true
  }
]

export default { plugin, data }
