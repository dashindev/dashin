import { ENV, request } from "@bunred/bunadmin"

export interface SignInParamsType {
  username: string
  password: string
}

async function userSignInService(params: SignInParamsType) {
  return request("/login", {
    prefix: ENV.AUTH_URL,
    method: "POST",
    data: params
  })
}

export default userSignInService
