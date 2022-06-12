import { IPluginData } from "@bunred/bunadmin"

const plugin = "auth-local"

const data: IPluginData[] = [
  {
    id: "bunadmin_auth_local_sign_in",
    group: "auth-local",
    name: "sign-in",
    label: "Sign-in",
    team: "bunadmin",
    customized: true,
    ignore_menu: true
  }
]

export default { plugin, data }
