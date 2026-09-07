import React, { useState } from "react"
import { SsoAuthConfig, SsoProviderConfig } from "../types"
import { detectIdpFromEmail, buildAuthorizationUrl } from "../router"
import { generateCodeVerifier, generateCodeChallenge, generateState } from "../pkce"

export interface SsoSignInProps {
  config?: SsoAuthConfig
  siteTitle?: string
  logo?: React.ReactNode
}

export const SsoSignIn: React.FC<SsoSignInProps> = ({
  config,
  siteTitle = "Dashin Enterprise",
  logo,
}) => {
  const [email, setEmail] = useState("")
  const [detectedProvider, setDetectedProvider] = useState<SsoProviderConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const providers = config?.providers || []

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEmail(val)
    if (config?.allowEmailRouting !== false) {
      const match = detectIdpFromEmail(val, providers)
      setDetectedProvider(match)
    }
  }

  const initiateSso = async (provider: SsoProviderConfig) => {
    try {
      setIsLoading(true)
      setError(null)
      const verifier = generateCodeVerifier()
      const challenge = await generateCodeChallenge(verifier)
      const state = generateState()

      if (typeof window !== "undefined") {
        sessionStorage.setItem("sso_code_verifier", verifier)
        sessionStorage.setItem("sso_state", state)
        sessionStorage.setItem("sso_provider_id", provider.id)
      }

      const authUrl = buildAuthorizationUrl(provider, {
        state,
        codeChallenge: challenge,
        loginHint: email || undefined,
      })

      if (typeof window !== "undefined") {
        window.location.href = authUrl
      }
    } catch (err: any) {
      setIsLoading(false)
      setError(err?.message || "Failed to initiate SSO login")
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-content-bg p-4">
      <div className="w-full max-w-[420px] rounded-bn border border-bn-border bg-content-box p-8 shadow-bn">
        <div className="flex flex-col items-center text-center">
          {logo || (
            <div className="flex h-12 w-12 items-center justify-center rounded-bn bg-primary/10 text-primary font-bold text-xl">
              D
            </div>
          )}
          <h1 className="mt-4 text-xl font-semibold text-foreground">{siteTitle}</h1>
          <p className="mt-1 text-xs text-icon-muted">Enterprise Single Sign-On (SSO)</p>
        </div>

        {error && (
          <div className="mt-4 rounded border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600">
            {error}
          </div>
        )}

        {/* Corporate Email Domain Routing */}
        {config?.allowEmailRouting !== false && (
          <div className="mt-6">
            <label className="block text-xs font-medium text-foreground mb-1">
              Corporate Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="alice@company.com"
                className="w-full rounded-bn border border-bn-border bg-content-box px-3.5 py-2.5 text-sm text-foreground placeholder:text-icon-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {detectedProvider && (
              <div className="mt-2.5 flex items-center justify-between rounded-bn border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">
                <span>Domain matched: <strong>{detectedProvider.name}</strong></span>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => initiateSso(detectedProvider)}
                  className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Continue →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick SSO Provider Buttons */}
        {providers.length > 0 && (
          <div className="mt-6 space-y-2.5">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-bn-border"></div>
              <span className="flex-shrink mx-3 text-xs text-icon-muted uppercase tracking-wider">Or Select Identity Provider</span>
              <div className="flex-grow border-t border-bn-border"></div>
            </div>

            {providers.map(p => (
              <button
                key={p.id}
                type="button"
                disabled={isLoading}
                onClick={() => initiateSso(p)}
                className="flex w-full items-center justify-center space-x-2.5 rounded-bn border border-bn-border bg-content-box px-4 py-2.5 text-sm font-medium text-foreground hover:bg-content-bg transition-colors disabled:opacity-50"
              >
                <span>Sign in with {p.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-icon-muted">
          Protected by Dashin Enterprise Security Architecture
        </div>
      </div>
    </div>
  )
}

export default SsoSignIn
