import initData from "./utils/initData"
export * from "./utils/types"

import SignIn from "./sign-in"
import { IAuthPlugin } from "@xbuilder/bunadmin"

export { initData, SignIn }

const authPlugin: IAuthPlugin = {
  authResponseKey: "id",
  // PocketBase: refresh/verify the current auth record
  authRequestUrl: "/api/collections/users/auth-refresh",
  authRequestMethod: "POST",
  authorizationOverwrite: async () => true
}
export const authResponseKey = authPlugin.authResponseKey
export const authRequestUrl = authPlugin.authRequestUrl
export const authRequestMethod = authPlugin.authRequestMethod
export const authorizationOverwrite = authPlugin.authorizationOverwrite
