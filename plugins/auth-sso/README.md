# @dashin-dev/auth-sso

Enterprise Single Sign-On (SSO) and SAML 2.0 / OIDC identity federation plugin for Dashin.

## Features

- **Multi-IdP Support**: Pre-configured templates for Okta, Microsoft Azure AD (Entra ID), Google Workspace, Keycloak, generic OIDC, and SAML 2.0.
- **Dynamic Corporate Email Routing**: Automatic detection of corporate IdP from user's email domain (e.g. `alice@acme.corp` -> auto routes to Acme's Okta instance).
- **PKCE & Security**: Built-in Proof Key for Code Exchange (S256) and cryptographically secure state validation.
- **Enterprise Claims & Role Mapping**: Flexible extraction of roles, permissions, tenant IDs, and nested user claims into Dashin's session context.
- **Hybrid Auth Fallback**: Optional toggle for local username/password or token fallback for emergency administrator access.
- **Dashin Design System**: Prebuilt `<SsoSignIn />` and `<SsoCallback />` components honoring Dashin design tokens (`bg-content-box`, `rounded-bn`, `border-bn-border`).
