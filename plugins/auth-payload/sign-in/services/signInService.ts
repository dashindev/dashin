import { ENV, request } from "@dashin-dev/dashin"

export interface SignInParamsType {
  username: string
  password: string
}

const AUTH_COLLECTION = "users"

/**
 * Map a Payload login response to dashin's expected shape. Pure (no network)
 * so it's unit-testable.
 */
export function mapPayloadAuth(res: any, fallbackEmail?: string) {
  if (!res || !res.token || !res.user) {
    return { errors: (res && (res.message || res.errors)) || "Sign in failed" }
  }
  return {
    id: res.user.id,
    token: res.token,
    user: {
      username: res.user.email || res.user.phone || fallbackEmail,
      role: res.user.role || "admin"
    }
  }
}

/**
 * Payload auth: POST /api/{collection}/login
 *   body { email, password } -> { token, user, exp }
 * Mapped to dashin's expected shape { id, token, user }.
 *
 * `username` is the email (Payload authenticates by email). AUTH_URL is the API
 * origin; the `/api` segment is included here.
 */
export default async function userSignInService(params: SignInParamsType) {
  const { username, password } = params

  const res = await request(`/api/${AUTH_COLLECTION}/login`, {
    prefix: ENV.AUTH_URL,
    method: "POST",
    data: { email: username, password }
  })

  return mapPayloadAuth(res, username)
}
