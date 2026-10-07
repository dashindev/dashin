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
      ...user,
      username: user.username || email,
      // Fail closed: a missing role field must not silently grant admin menus.
      role: user.role || "user",
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

  // Pure mapping — the atomo_auth_token localStorage write moved to the
  // submit controller's afterPersist hook so a failed/partial sign-in can
  // never leave a stored token behind.
  return mapAtomoAuth(res, username)
}
