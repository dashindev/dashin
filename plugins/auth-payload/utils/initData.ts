import { IPluginData } from "@dashin-dev/dashin"

const plugin = "auth-payload"

const data: IPluginData[] = [
  {
    id: "dashin_auth_payload_sign_in",
    group: "auth-payload",
    name: "sign-in",
    label: "Sign-in",
    team: "dashin",
    customized: true,
    ignore_menu: true
  }
]

export default { plugin, data }
