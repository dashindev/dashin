import { ENV, request } from "@xbuilder/bunadmin"

export interface SignInParamsType {
  username: string
  password: string
}

/**
 * PocketBase auth: POST /api/collections/users/auth-with-password
 *   body { identity, password } -> { token, record }
 * Mapped to bunadmin's expected shape { id, token, user }.
 */
export default async function userSignInService(params: SignInParamsType) {
  const { username, password } = params

  const res = await request("/api/collections/users/auth-with-password", {
    prefix: ENV.AUTH_URL,
    method: "POST",
    data: { identity: username, password }
  })

  if (!res || !res.token || !res.record) {
    return { errors: res || "Sign in failed" }
  }

  return {
    id: res.record.id,
    token: res.token,
    user: {
      username: res.record.username || res.record.email || username,
      role: res.record.role || "user"
    }
  }
}
