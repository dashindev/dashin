import { IPluginData } from "@dashin-dev/dashin"

const plugin = "auth-atomo"

const data: IPluginData[] = [
  {
    id: "dashin_auth_atomo_sign_in",
    group: "auth-atomo",
    name: "sign-in",
    label: "Sign-in",
    team: "dashin",
    customized: true,
    ignore_menu: true,
  },
]

export default { plugin, data }
