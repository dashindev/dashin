import { ENV, request } from "@dashin-dev/dashin"

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
