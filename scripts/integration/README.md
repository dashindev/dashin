# Isolated adapter integration checks

Run from the repository root with Node 20 and built local packages. These checks
for adapters are opt-in; they are not yet part of GitHub CI. They never read Jiazan config or
production credentials. Synthetic writes target only disposable databases.

## D1

```sh
node scripts/integration/d1-local-smoke.mjs
```

Requires the existing locked dependencies in `workers/d1-demo-api/node_modules`
(install that worker's lockfile dependencies if absent). Runs the actual gateway
source with Miniflare/workerd, an independent temporary SQLite directory, and an
ephemeral loopback port. Uses real controller/request/SQL execution; only UI
notifications and token storage are replaced. Covers pagination, an empty result,
COUNT/SELECT rejection, cancellation, partial mutation and failed-ID-only retry.
This is local D1 simulation, not Cloudflare production validation. The optional
rate limiter is not configured. The runner disposes its worker and state.

## Payload 3

```sh
node scripts/integration/payload3-local-smoke.mjs
```

Windows runner requires WSL distribution `Ubuntu`, its running Docker engine,
and an already cached `node:20-alpine` image. It records the exact image digest
used. Copies the pinned fixture via the Docker API into a dedicated non-root
container with a dynamic loopback-only port, rather than starting an existing
Compose service. No external database, account, or login is used. pnpm 9.15.9
installs dependencies only in that container; the monorepo lockfile is not changed.

The fixture pins Payload/@payloadcms/next/@payloadcms/db-sqlite 3.90.2. It uses
Payload's real REST handlers and SQLite; the small Node HTTP bridge is transport,
not a mocked Payload protocol. It does **not** verify a Next.js app, SSR, the
Payload admin UI, or an authenticated deployment. A run nonce prevents tests
from connecting to another service. On failure the runner reads the last container
logs into its output; on completion/failure it removes its own container and files.

Tests cover pagination, empty search, actual hook refusal, an in-flight abort,
partial update with real validation rejection, readback and failed-ID-only retry.
HTTP rejection is conservatively classified unknown, not proof of no write.

Official reference: [Payload REST testing](https://payloadcms.com/docs/rest-api/overview).

## Other template runtime smoke

```sh
node scripts/smoke/template-prod-smoke.mjs
node scripts/smoke/template-prod-smoke.mjs --template=typescript-nextjs
node scripts/smoke/template-prod-smoke.mjs --template=fullstack-atomo
```

Requires local built packages and Playwright Chromium. Scaffolds into a temporary
directory with local tarballs, installs dependencies, builds, and runs a browser
against its own nonce-identified loopback server. Service env URLs are replaced
with a deliberately unavailable loopback URL; external browser requests are
blocked. Sign-in/welcome rendering and absence of page errors are required.
Atomo coverage is frontend-only: it does not start Atomo/Postgres Compose or
verify backend/authentication. Next builds the unchanged template configuration;
failures must not be silently repaired in the copied fixture to claim success.
The existing CI template-smoke job runs Vite twice, Next twice and the Atomo
frontend once. Its success does not imply the opt-in adapter integrations ran.
