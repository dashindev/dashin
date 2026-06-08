import initData from "./utils/initData"
export * from "./utils/types"

import SignIn from "./sign-in"
import { IAuthPlugin } from "@dashin-dev/dashin"

export { initData, SignIn }

// Payload auth collection slug (the `auth: true` collection used for admins).
export const AUTH_COLLECTION = "users"

const authPlugin: IAuthPlugin = {
  authResponseKey: "id",
  // Verify/refresh the current session. prefix is MAIN_URL (the API origin),
  // so include the Payload `/api` segment.
  authRequestUrl: `/api/${AUTH_COLLECTION}/me`,
  authRequestMethod: "GET",
  authorizationOverwrite: async () => true
}
export const authResponseKey = authPlugin.authResponseKey
export const authRequestUrl = authPlugin.authRequestUrl
export const authRequestMethod = authPlugin.authRequestMethod
export const authorizationOverwrite = authPlugin.authorizationOverwrite
