import initData from "./utils/initData"
export * from "./utils/types"

import users from "./users"
import roles from "./roles"
import SignIn from "./sign-in"

export { initData, SignIn, users, roles }

export const authResponseKey = "id"
export const authRequestUrl = "/users/me?populate=*"
export const authRequestMethod = "GET"
