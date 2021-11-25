import initData from "./utils/initData"

import users from "./users"
import SignIn from "./sign-in"

export { initData, users, SignIn }

export const authResponseKey = "id"
export const authRequestUrl = "/auth/me"
export const authRequestMethod = "POST"
