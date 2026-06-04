import { AuthProps, ENV, request, storedToken } from "@/utils"

export default async function authorization({
  authResponseKey = "id",
  authRequestUrl = "/auth/me",
  authRequestMethod = "GET"
}: AuthProps): Promise<boolean> {
  const asPath = window.location.pathname

  for (let i = 0; i < ENV.PATHS_WITHOUT_AUTH.length; i++) {
    const item = ENV.PATHS_WITHOUT_AUTH[i]
    const itemRegx = new RegExp(`${item}.*`, "g")
    if (itemRegx.test(asPath)) return true
  }

  const response = await authService()
  const isVerified = response && response[authResponseKey]

  return !!isVerified

  async function authService(token?: string): Promise<any> {
    if (!token) token = await storedToken()

    // query remote user with token
    return request(authRequestUrl, {
      prefix: ENV.AUTH_URL,
      method: authRequestMethod,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}
