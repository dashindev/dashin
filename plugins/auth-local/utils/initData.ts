import { IPluginData } from "@dashin-dev/dashin"

const plugin = "auth-local"

const data: IPluginData[] = [
  {
    id: "dashin_auth_local_sign_in",
    group: "auth-local",
    name: "sign-in",
    label: "Sign-in",
    team: "dashin",
    customized: true,
    ignore_menu: true
  }
]

export default { plugin, data }
