export type IdpType =
  | "oidc"
  | "saml"
  | "okta"
  | "azure-ad"
  | "google"
  | "keycloak"
  | "custom"

export interface ClaimsMappingConfig {
  idKey?: string
  emailKey?: string
  nameKey?: string
  avatarKey?: string
  roleKey?: string
  roleMapping?: Record<string, string>
  defaultRole?: string
  tenantIdKey?: string
  transform?: (rawClaims: Record<string, any>) => Partial<SsoUser>
}

export interface SsoProviderConfig {
  id: string
  name: string
  type: IdpType
  domains?: string[]
  icon?: string
  issuer?: string
  clientId?: string
  clientSecret?: string
  authorizationEndpoint?: string
  tokenEndpoint?: string
  userInfoEndpoint?: string
  samlEntryUrl?: string
  redirectUri?: string
  scopes?: string[]
  claimsMapping?: ClaimsMappingConfig
  extraParams?: Record<string, string>
}

export interface SsoUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
  roles?: string[]
  tenantId?: string
  rawClaims: Record<string, any>
}

export interface SsoTokens {
  accessToken: string
  idToken?: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
}

export interface SsoAuthConfig {
  providers: SsoProviderConfig[]
  defaultProviderId?: string
  allowEmailRouting?: boolean
  allowPasswordFallback?: boolean
  onSuccess?: (user: SsoUser, tokens: SsoTokens) => void | Promise<void>
  onError?: (error: Error) => void
  storageKey?: string
  authRequestUrl?: string
  authResponseKey?: string
}
