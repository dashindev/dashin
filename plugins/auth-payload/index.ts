import initData from "./utils/initData"
export * from "./utils/types"

import SignIn from "./sign-in"
import { IAuthPlugin } from "@dashin-dev/dashin"

export { initData, SignIn }

// Payload auth collection slug (the `auth: true` collection used for admins).
export const AUTH_COLLECTION = "users"

// Session check: dashin GETs authRequestUrl with the stored Bearer token (prefix
// = ENV.AUTH_URL, the API origin) and treats the user as logged-in only when
// response[authResponseKey] is truthy. Payload `/api/{collection}/me` returns
// { user: {...} } when authed and { user: null } when not — so the key is
// "user". Do NOT set authorizationOverwrite: that bypasses this check entirely,
// leaving signed-out users on empty pages instead of the sign-in screen.
const authPlugin: IAuthPlugin = {
  authResponseKey: "user",
  authRequestUrl: `/api/${AUTH_COLLECTION}/me`,
  authRequestMethod: "GET"
}
export const authResponseKey = authPlugin.authResponseKey
export const authRequestUrl = authPlugin.authRequestUrl
export const authRequestMethod = authPlugin.authRequestMethod
