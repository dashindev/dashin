import { ENV, request } from "@xbuilder/bunadmin"

export interface SignUpParamsType {
  username: string
  email: string
  password: string
}

async function userSignUpService(params: SignUpParamsType) {
  return request("/auth/local/register", {
    prefix: ENV.AUTH_URL,
    method: "POST",
    data: params
  })
}

export default userSignUpService
