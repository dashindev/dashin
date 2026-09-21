# Dashin 2.0.0-alpha.8 Release Preparation Plan

## Objective

Prepare an auditable `2.0.0-alpha.8` release candidate from the latest
`master` after Phase 12 and the `smol-toml` security follow-up. This phase ends
with a tested, packed, and reviewable release branch; publishing requires a
separate explicit authorization.

## Version scope

1. Set the fixed Lerna version to `2.0.0-alpha.8`.
2. Set all 23 publishable `@dashin-dev/*` workspace package versions to
   `2.0.0-alpha.8`.
3. Update every `@dashin-dev/*` dependency in the three CLI template
   `package.json` files to `^2.0.0-alpha.8`.
4. Do not modify Jiazan dependencies or its `_shared/api.ts` defense.

## Verification gates

- Node 20 with Yarn 1.22.22: `yarn install --frozen-lockfile`
- Complete 23-package build and Dashin typecheck/production build
- Dashin, Payload, and D1 complete unit suites
- Playwright E2E
- VitePress documentation build
- Template production smoke twice
- `git diff --check` and generated-artifact cleanup

## Package audit

Run `npm pack --dry-run --json` for every publishable workspace package and
verify the package name/version, runtime entry points, declaration files,
required assets, and exclusion of tests, temporary files, recordings, local
secrets, and build-only debris.

## Delivery boundary

The release branch may be committed and pushed for checks. Do not run the npm
publishing script, create npm or Git tags, merge a release PR, or update
downstream Jiazan until the owner gives a new explicit authorization.
