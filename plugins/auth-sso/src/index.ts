import { IAuthPlugin, IPluginData } from "@dashin-dev/dashin"
import SsoSignIn from "./components/SsoSignIn"

export * from "./types"
export * from "./pkce"
export * from "./claims"
export * from "./router"
export * from "./callback"
export * from "./components/SsoSignIn"
export * from "./components/SsoCallback"

export const SignIn = SsoSignIn

const plugin = "auth-sso"
const data: IPluginData[] = [
  {
    id: "dashin_auth_sso_sign_in",
    group: "auth-sso",
    name: "sign-in",
    label: "Enterprise SSO Sign-in",
    team: "dashin",
    customized: true,
    ignore_menu: true,
  },
]

export const initData = { plugin, data }

const authPlugin: IAuthPlugin = {
  authResponseKey: "email",
  authRequestUrl: "/auth/me",
  authRequestMethod: "GET",
}

export const authResponseKey = authPlugin.authResponseKey
export const authRequestUrl = authPlugin.authRequestUrl
export const authRequestMethod = authPlugin.authRequestMethod

export default authPlugin
