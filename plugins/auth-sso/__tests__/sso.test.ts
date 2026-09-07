import { describe, it, expect } from "vitest"
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  validateState,
} from "../src/pkce"
import { mapClaimsToUser } from "../src/claims"
import { detectIdpFromEmail, buildAuthorizationUrl } from "../src/router"
import { parseCallbackParams } from "../src/callback"
import { SsoProviderConfig } from "../src/types"

describe("Enterprise SSO Plugin (@dashin-dev/auth-sso)", () => {
  describe("PKCE and CSRF security utils", () => {
    it("generates a high-entropy code verifier with proper length", () => {
      const verifier = generateCodeVerifier(64)
      expect(verifier).toBeTypeOf("string")
      expect(verifier.length).toBe(64)
      // Only valid RFC 7636 unreserved characters
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/)
    })

    it("generates and verifies cryptographic state", () => {
      const state = generateState(32)
      expect(state.length).toBe(32)
      expect(validateState(state, state)).toBe(true)
      expect(validateState(state, "tampered-state")).toBe(false)
      expect(validateState(null, state)).toBe(false)
    })

    it("hashes code verifier into S256 code challenge", async () => {
      const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
      const challenge = await generateCodeChallenge(verifier)
      expect(challenge).toBeTypeOf("string")
      expect(challenge.length).toBeGreaterThan(20)
      expect(challenge).not.toContain("+")
      expect(challenge).not.toContain("/")
      expect(challenge).not.toContain("=")
    })
  })

  describe("Corporate Email Domain Routing", () => {
    const providers: SsoProviderConfig[] = [
      {
        id: "acme-okta",
        name: "Acme Corp Okta",
        type: "okta",
        domains: ["acme.corp", "acmecorp.com"],
        issuer: "https://acme.okta.com",
      },
      {
        id: "global-entra",
        name: "Global Microsoft Entra",
        type: "azure-ad",
        domains: ["globaltech.io"],
        authorizationEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      },
    ]

    it("detects provider by exact corporate email domain", () => {
      const match = detectIdpFromEmail("alice@acme.corp", providers)
      expect(match).not.toBeNull()
      expect(match?.id).toBe("acme-okta")
    })

    it("detects provider with subdomain inheritance", () => {
      const match = detectIdpFromEmail("bob@engineering.acmecorp.com", providers)
      expect(match).not.toBeNull()
      expect(match?.id).toBe("acme-okta")
    })

    it("returns null for non-matching external email", () => {
      const match = detectIdpFromEmail("stranger@gmail.com", providers)
      expect(match).toBeNull()
    })
  })

  describe("Claims and Role Mapping", () => {
    it("maps Okta claims with group-to-role transformation", () => {
      const rawOkta = {
        sub: "00u12345678",
        email: "alice@acme.corp",
        name: "Alice Wang",
        groups: ["Dashin-Admins", "Engineering"],
      }

      const user = mapClaimsToUser(
        rawOkta,
        {
          roleMapping: {
            "Dashin-Admins": "super_admin",
            Engineering: "editor",
          },
          defaultRole: "viewer",
        },
        "okta"
      )

      expect(user.id).toBe("00u12345678")
      expect(user.email).toBe("alice@acme.corp")
      expect(user.name).toBe("Alice Wang")
      expect(user.role).toBe("super_admin")
      expect(user.roles).toContain("Dashin-Admins")
    })

    it("maps Azure AD (Entra ID) claims with tid as tenantId", () => {
      const rawAzure = {
        oid: "azure-uuid-999",
        preferred_username: "bob@contoso.onmicrosoft.com",
        name: "Bob Builder",
        tid: "tenant-tenant-1234",
        roles: ["ComplianceAuditor"],
      }

      const user = mapClaimsToUser(rawAzure, {}, "azure-ad")
      expect(user.id).toBe("azure-uuid-999")
      expect(user.email).toBe("bob@contoso.onmicrosoft.com")
      expect(user.tenantId).toBe("tenant-tenant-1234")
      expect(user.role).toBe("ComplianceAuditor")
    })

    it("falls back to defaultRole when no mapped roles match", () => {
      const raw = {
        sub: "user-404",
        email: "guest@external.com",
        name: "Guest User",
        groups: ["RandomGroup"],
      }

      const user = mapClaimsToUser(
        raw,
        {
          roleMapping: { Executive: "admin" },
          defaultRole: "guest_viewer",
        },
        "oidc"
      )

      expect(user.role).toBe("guest_viewer")
    })
  })

  describe("Authorization URL and Callback Parser", () => {
    it("constructs standard OIDC authorization URL with PKCE parameters", () => {
      const provider: SsoProviderConfig = {
        id: "keycloak-corp",
        name: "Keycloak",
        type: "oidc",
        authorizationEndpoint: "https://sso.example.com/auth/realms/corp/protocol/openid-connect/auth",
        clientId: "dashin-app",
        redirectUri: "https://dashin.example.com/auth/sso/callback",
        scopes: ["openid", "profile", "email", "roles"],
      }

      const url = buildAuthorizationUrl(provider, {
        state: "state123",
        codeChallenge: "challenge456",
        loginHint: "test@example.com",
      })

      expect(url).toContain("https://sso.example.com/auth/realms/corp/protocol/openid-connect/auth?")
      expect(url).toContain("client_id=dashin-app")
      expect(url).toContain("response_type=code")
      expect(url).toContain("state=state123")
      expect(url).toContain("code_challenge=challenge456")
      expect(url).toContain("code_challenge_method=S256")
      expect(url).toContain("login_hint=test%40example.com")
    })

    it("parses callback URL search params and handles errors", () => {
      const normalParams = parseCallbackParams("?code=auth_code_xyz&state=state_abc")
      expect(normalParams.code).toBe("auth_code_xyz")
      expect(normalParams.state).toBe("state_abc")
      expect(normalParams.error).toBeUndefined()

      const errorParams = parseCallbackParams("?error=access_denied&error_description=User+cancelled")
      expect(errorParams.error).toBe("access_denied")
      expect(errorParams.errorDescription).toBe("User cancelled")
    })
  })
})
