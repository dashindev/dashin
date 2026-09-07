import { SsoProviderConfig, SsoTokens } from "./types"

export interface CallbackParsedParams {
  code?: string
  state?: string
  error?: string
  errorDescription?: string
  samlResponse?: string
}

export function parseCallbackParams(queryOrHash: string): CallbackParsedParams {
  const clean = queryOrHash.startsWith("?") || queryOrHash.startsWith("#") ? queryOrHash.slice(1) : queryOrHash
  const params = new URLSearchParams(clean)
  return {
    code: params.get("code") || undefined,
    state: params.get("state") || params.get("RelayState") || undefined,
    error: params.get("error") || undefined,
    errorDescription: params.get("error_description") || undefined,
    samlResponse: params.get("SAMLResponse") || undefined,
  }
}

export async function handleSsoCodeExchange(
  provider: SsoProviderConfig,
  code: string,
  codeVerifier?: string,
  redirectUri?: string
): Promise<SsoTokens> {
  const tokenEndpoint = provider.tokenEndpoint || (provider.issuer ? provider.issuer.replace(/\/?$/, "") + "/oauth2/v1/token" : "")
  if (!tokenEndpoint) {
    throw new Error(`Provider "${provider.name}" lacks tokenEndpoint configuration.`)
  }

  const body = new URLSearchParams()
  body.set("grant_type", "authorization_code")
  body.set("code", code)
  if (provider.clientId) body.set("client_id", provider.clientId)
  if (provider.clientSecret) body.set("client_secret", provider.clientSecret)
  if (redirectUri || provider.redirectUri) body.set("redirect_uri", redirectUri || provider.redirectUri!)
  if (codeVerifier) body.set("code_verifier", codeVerifier)

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`SSO Token Exchange failed with status ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type || "Bearer",
  }
}

export async function fetchUserInfo(
  provider: SsoProviderConfig,
  accessToken: string
): Promise<Record<string, any>> {
  const endpoint = provider.userInfoEndpoint || (provider.issuer ? provider.issuer.replace(/\/?$/, "") + "/oauth2/v1/userinfo" : "")
  if (!endpoint) {
    throw new Error(`Provider "${provider.name}" lacks userInfoEndpoint configuration.`)
  }

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch SSO userinfo (${res.status}): ${await res.text()}`)
  }

  return await res.json()
}
