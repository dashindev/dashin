import { IPluginData } from "@xbuilder/bunadmin"

const plugin = "auth-strapi"

const data: IPluginData[] = [
  {
    id: "bunadmin_auth_strapi_sign_in",
    group: "auth-strapi",
    name: "sign-in",
    label: "Sign-in",
    team: "bunadmin",
    customized: true,
    ignore_menu: true
  },
  {
    id: "bunadmin_auth_strapi_users",
    group: "auth-strapi",
    name: "users",
    label: "User",
    team: "bunadmin",
    customized: true,
    icon_type: "eva",
    icon: "person-outline",
    rank: "100",
    role: process.env.REACT_APP_AUTH_STRAPI_ROLE
  },
  {
    id: "bunadmin_auth_strapi_roles",
    group: "auth-strapi",
    name: "roles",
    label: "Role",
    team: "bunadmin",
    customized: true,
    icon_type: "eva",
    icon: "people-outline",
    rank: "100",
    role: process.env.REACT_APP_AUTH_STRAPI_ROLE
  }
]

export default { plugin, data }
