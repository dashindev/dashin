import React, { useEffect, useState } from "react"
import { SsoAuthConfig } from "../types"
import { parseCallbackParams, handleSsoCodeExchange, fetchUserInfo } from "../callback"
import { mapClaimsToUser } from "../claims"
import { resolveIdpConfig } from "../router"
import { validateState } from "../pkce"

export interface SsoCallbackProps {
  config: SsoAuthConfig
  redirectOnSuccess?: string
}

export const SsoCallback: React.FC<SsoCallbackProps> = ({
  config,
  redirectOnSuccess = "/",
}) => {
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    async function processCallback() {
      try {
        if (typeof window === "undefined") return
        const params = parseCallbackParams(window.location.search || window.location.hash)

        if (params.error) {
          throw new Error(params.errorDescription || params.error || "SSO identity provider returned an error")
        }

        const storedState = sessionStorage.getItem("sso_state")
        if (storedState && !validateState(storedState, params.state)) {
          throw new Error("Invalid state parameter (CSRF validation failure)")
        }

        const providerId = sessionStorage.getItem("sso_provider_id") || config.defaultProviderId
        if (!providerId) {
          throw new Error("No identity provider context found for callback")
        }

        const provider = resolveIdpConfig(providerId, config.providers)
        if (!provider) {
          throw new Error(`Unknown identity provider "${providerId}"`)
        }

        if (!params.code) {
          throw new Error("No authorization code found in callback query parameters")
        }

        const codeVerifier = sessionStorage.getItem("sso_code_verifier") || undefined
        const tokens = await handleSsoCodeExchange(provider, params.code, codeVerifier)

        // Fetch user info or decode claims
        let rawClaims: Record<string, any> = {}
        if (provider.userInfoEndpoint || provider.issuer) {
          rawClaims = await fetchUserInfo(provider, tokens.accessToken)
        }

        const user = mapClaimsToUser(rawClaims, provider.claimsMapping, provider.type)

        // Store tokens
        localStorage.setItem("token", tokens.accessToken)
        localStorage.setItem("sso_user", JSON.stringify(user))

        // Trigger config callback if provided
        if (config.onSuccess) {
          await config.onSuccess(user, tokens)
        }

        setStatus("success")
        window.location.assign(redirectOnSuccess)
      } catch (err: any) {
        setStatus("error")
        setErrorMessage(err?.message || "SSO Callback exchange encountered an error")
        if (config.onError) config.onError(err)
      }
    }

    processCallback()
  }, [config, redirectOnSuccess])

  return (
    <div className="flex min-h-screen items-center justify-center bg-content-bg p-4">
      <div className="max-w-md w-full rounded-bn border border-bn-border bg-content-box p-6 text-center shadow-bn">
        {status === "loading" && (
          <div>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <h2 className="mt-4 text-sm font-medium text-foreground">Completing enterprise login...</h2>
            <p className="mt-1 text-xs text-icon-muted">Verifying credentials and exchanging tokens</p>
          </div>
        )}
        {status === "error" && (
          <div>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 font-bold text-lg">
              ✕
            </div>
            <h2 className="mt-3 text-sm font-semibold text-foreground">Single Sign-On Failed</h2>
            <p className="mt-2 text-xs text-rose-600 bg-rose-500/5 p-2 rounded border border-rose-500/15">{errorMessage}</p>
            <a
              href="/auth/sign-in"
              className="mt-4 inline-block rounded-bn bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90"
            >
              Return to Login
            </a>
          </div>
        )}
        {status === "success" && (
          <div>
            <h2 className="text-sm font-medium text-foreground">Authentication successful</h2>
            <p className="mt-1 text-xs text-icon-muted">Redirecting to application...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SsoCallback
