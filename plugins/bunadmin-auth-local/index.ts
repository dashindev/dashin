import initData from "./utils/initData"
export * from "./utils/types"

import SignIn from "./sign-in"
import { IAuthPlugin } from "@bunred/bunadmin"

export { initData, SignIn }

const authPlugin: IAuthPlugin = {
  authResponseKey: "id",
  authRequestUrl: "/users/me",
  authRequestMethod: "authRequestMethod",
  authorizationOverwrite: async () => true
}
export const authResponseKey = authPlugin.authResponseKey
export const authRequestUrl = authPlugin.authRequestUrl
export const authRequestMethod = authPlugin.authRequestMethod
export const authorizationOverwrite = authPlugin.authorizationOverwrite

export const LOCAL_USERNAME = "admin"
export const LOCAL_PASSWORD = "bunadmin"
