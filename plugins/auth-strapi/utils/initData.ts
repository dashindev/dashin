import { IPluginData } from "@dashin-dev/dashin"

const plugin = "auth-strapi"

const data: IPluginData[] = [
  {
    id: "dashin_auth_strapi_sign_in",
    group: "auth-strapi",
    name: "sign-in",
    label: "Sign-in",
    team: "dashin",
    customized: true,
    ignore_menu: true
  },
  {
    id: "dashin_auth_strapi_sign_up",
    group: "auth-strapi",
    name: "sign-up",
    label: "Sign-up",
    team: "dashin",
    customized: true,
    ignore_menu: true
  },
  {
    id: "dashin_auth_strapi_users",
    group: "auth-strapi",
    name: "users",
    label: "User",
    team: "dashin",
    customized: true,
    icon_type: "eva",
    icon: "person-outline",
    rank: "100",
    role:
      process.env.VITE_AUTH_STRAPI_ROLE ||
      "Admin,Reviewer"
  },
  {
    id: "dashin_auth_strapi_roles",
    group: "auth-strapi",
    name: "roles",
    label: "Role",
    team: "dashin",
    customized: true,
    icon_type: "eva",
    icon: "people-outline",
    rank: "100",
    role:
      process.env.VITE_AUTH_STRAPI_ROLE ||
      "Admin,Reviewer"
  }
]

export default { plugin, data }
