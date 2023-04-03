import initData from "./utils/initData"
export * from "./utils/types"

import users from "./users"
import roles from "./roles"
import SignIn from "./sign-in"
import SignUp from "./sign-up"

export { initData, SignIn, SignUp, users, roles }
export * from "./utils/i18n"

export const authResponseKey = "id"
export const authRequestUrl = "/users/me?populate=*"
export const authRequestMethod = "GET"
