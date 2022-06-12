import initData from "./utils/initData"
export * from "./utils/types"

import SignIn from "./sign-in"

export { initData, SignIn }

export const authResponseKey = "id"
export const authRequestUrl = "/users/me"
export const authRequestMethod = "GET"
export const authorizationOverwrite = () => true

export const LOCAL_USERNAME = "admin"
export const LOCAL_PASSWORD = "bunadmin"
