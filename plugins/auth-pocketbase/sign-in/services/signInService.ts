import { ENV, request } from "@dashin-dev/dashin"

export interface SignInParamsType {
  username: string
  password: string
}

/**
 * Map a PocketBase auth-with-password response to dashin's expected shape.
 * Pure (no network) so it's unit-testable.
 */
export function mapPbAuth(res: any, fallbackUsername?: string) {
  if (!res || !res.token || !res.record) {
    return { errors: res || "Sign in failed" }
  }
  return {
    id: res.record.id,
    token: res.token,
    user: {
      username: res.record.username || res.record.email || fallbackUsername,
      role: res.record.role || "user"
    }
  }
}

/**
 * PocketBase auth: POST /api/collections/users/auth-with-password
 *   body { identity, password } -> { token, record }
 * Mapped to dashin's expected shape { id, token, user }.
 */
export default async function userSignInService(params: SignInParamsType) {
  const { username, password } = params

  const res = await request("/api/collections/users/auth-with-password", {
    prefix: ENV.AUTH_URL,
    method: "POST",
    data: { identity: username, password }
  })

  return mapPbAuth(res, username)
}
