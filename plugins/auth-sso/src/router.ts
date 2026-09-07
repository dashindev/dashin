import { SsoProviderConfig } from "./types"

/**
 * Detect corporate identity provider by user's email domain.
 * Supports exact domain match and subdomain inheritance (e.g. corp.acme.com -> acme.com).
 */
export function detectIdpFromEmail(email: string, providers: SsoProviderConfig[]): SsoProviderConfig | null {
  if (!email || !email.includes("@")) return null
  const fullDomain = email.split("@")[1].toLowerCase().trim()
  const domainParts = fullDomain.split(".")

  for (const provider of providers) {
    if (!provider.domains || provider.domains.length === 0) continue
    const cleanDomains = provider.domains.map(d => d.toLowerCase().trim())
    // 1. Direct exact match
    if (cleanDomains.includes(fullDomain)) {
      return provider
    }
    // 2. Subdomain check: e.g. dev.acme.com -> matches acme.com
    for (let i = 1; i < domainParts.length - 1; i++) {
      const parentDomain = domainParts.slice(i).join(".")
      if (cleanDomains.includes(parentDomain)) {
        return provider
      }
    }
  }

  return null
}

export function resolveIdpConfig(providerId: string, providers: SsoProviderConfig[]): SsoProviderConfig | null {
  return providers.find(p => p.id === providerId) || null
}

export interface BuildAuthUrlOptions {
  state?: string
  codeChallenge?: string
  codeChallengeMethod?: string
  prompt?: string
  loginHint?: string
  redirectUri?: string
}

/**
 * Builds standard OAuth2 / OIDC or SAML entry redirect URL.
 */
export function buildAuthorizationUrl(
  provider: SsoProviderConfig,
  options: BuildAuthUrlOptions = {}
): string {
  // If SAML provider with entry URL
  if (provider.type === "saml" && provider.samlEntryUrl) {
    const url = new URL(provider.samlEntryUrl)
    if (options.state) url.searchParams.set("RelayState", options.state)
    return url.toString()
  }

  const endpoint = provider.authorizationEndpoint || (provider.issuer ? provider.issuer.replace(/\/?$/, "") + "/oauth2/v1/authorize" : "")
  if (!endpoint) {
    throw new Error(`Provider "${provider.name}" (${provider.id}) lacks authorizationEndpoint or issuer configuration.`)
  }

  const url = new URL(endpoint)
  if (provider.clientId) url.searchParams.set("client_id", provider.clientId)
  url.searchParams.set("response_type", "code")

  const redirect = options.redirectUri || provider.redirectUri || (typeof window !== "undefined" ? window.location.origin + "/auth/sso/callback" : "")
  if (redirect) url.searchParams.set("redirect_uri", redirect)

  const scopes = provider.scopes && provider.scopes.length > 0 ? provider.scopes.join(" ") : "openid profile email"
  url.searchParams.set("scope", scopes)

  if (options.state) url.searchParams.set("state", options.state)
  if (options.codeChallenge) {
    url.searchParams.set("code_challenge", options.codeChallenge)
    url.searchParams.set("code_challenge_method", options.codeChallengeMethod || "S256")
  }
  if (options.prompt) url.searchParams.set("prompt", options.prompt)
  if (options.loginHint) url.searchParams.set("login_hint", options.loginHint)

  if (provider.extraParams) {
    for (const [k, v] of Object.entries(provider.extraParams)) {
      url.searchParams.set(k, v)
    }
  }

  return url.toString()
}
