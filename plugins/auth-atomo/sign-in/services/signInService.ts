import { ENV, request } from "@dashin-dev/dashin"

export interface SignInParamsType {
  username: string
  password: string
}

export function mapAtomoAuth(res: any, fallbackEmail?: string) {
  if (!res || !res.token) {
    return { errors: (res && (res.message || res.error || res.errors)) || "Sign in failed" }
  }
  const user = res.user || {}
  const email = user.email || fallbackEmail
  return {
    id: user.id || "user",
    token: res.token,
    user: {
      username: email,
      role: user.role || "admin",
      ...user,
    },
  }
}

export default async function userSignInService(params: SignInParamsType) {
  const { username, password } = params

  const res = await request("/auth/login", {
    prefix: ENV.AUTH_URL || ENV.MAIN_URL,
    method: "POST",
    data: { email: username, password },
  })

  const mapped = mapAtomoAuth(res, username)
  if (mapped.token && typeof window !== "undefined") {
    localStorage.setItem("atomo_auth_token", mapped.token)
  }
  return mapped
}
