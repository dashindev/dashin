import { IPluginData } from "@bunred/bunadmin"

export default {
  plugin: "auth-bunhook",
  data: [
    {
      id: "bunadmin_auth_bunhook_sign_in",
      group: "auth-bunhook",
      name: "sign-in",
      label: "Sign-in",
      team: "bunadmin",
      customized: true,
      ignore_menu: true
    },
    {
      id: "bunadmin_auth_bunhook_users",
      group: "auth-bunhook",
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
