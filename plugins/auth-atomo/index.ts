import initData from "./utils/initData"
export * from "./utils/types"

import SignIn from "./sign-in"
import { IAuthPlugin } from "@dashin-dev/dashin"

export { initData, SignIn }

// Session check: Dashin GETs authRequestUrl with the stored Bearer token (prefix
// = ENV.AUTH_URL || ENV.MAIN_URL) and treats the user as logged-in when
// response[authResponseKey] is truthy. Atomo `/auth/me` returns `{ id, email, role, ... }`.
const authPlugin: IAuthPlugin = {
  authResponseKey: "email",
  authRequestUrl: "/auth/me",
  authRequestMethod: "GET",
}

export const authResponseKey = authPlugin.authResponseKey
export const authRequestUrl = authPlugin.authRequestUrl
export const authRequestMethod = authPlugin.authRequestMethod
