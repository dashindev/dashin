# @dashin-dev/auth-atomo

Official Atomo authentication plugin for [Dashin](https://dashin.dev). Provides JWT session management, login API integration, and automatic authorization headers for [Atomo](https://github.com/atomo-cc/atomo) backends.

## Features

- **Atomo Auth Flow**: Authenticates directly against Atomo's `/auth/login` and validates sessions via `/auth/me`.
- **Token Persistence**: Stores session tokens safely in localStorage/sessionStorage.
- **Request Interception**: Automatically injects `Authorization: Bearer <token>` into all outgoing network requests.
- **Auto Logout & Redirect**: Handles 401 Unauthorized responses with clean redirection to the login view.

## Installation

```bash
yarn add @dashin-dev/auth-atomo @dashin-dev/dashin
# or
pnpm add @dashin-dev/auth-atomo @dashin-dev/dashin
```

## Usage

Register the authentication plugin in your Dashin plugins configuration:

```tsx
import { signInService } from '@dashin-dev/auth-atomo'

export default {
  id: 'auth-atomo',
  signIn: (credentials) =>
    signInService({
      username: credentials.username,
      password: credentials.password,
      baseUrl: process.env.VITE_ATOMO_URL || 'http://localhost:3000'
    })
}
```

## License

Apache-2.0
