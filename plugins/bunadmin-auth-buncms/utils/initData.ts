import { IPluginData } from "@xbuilder/bunadmin"

export default {
  plugin: "auth-buncms",
  data: [
    {
      id: "bunadmin_auth_buncms_sign_in",
      group: "auth-buncms",
      name: "sign-in",
      label: "Sign-in",
      team: "bunadmin",
      customized: true,
      ignore_menu: true
    },
    {
      id: "bunadmin_auth_buncms_users",
      group: "auth-buncms",
      name: "users",
      label: "User",
      team: "bunadmin",
      customized: true,
      icon_type: "eva",
      icon: "person-outline",
      rank: "100"
    }
  ] as IPluginData[]
}
