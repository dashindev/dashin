# `smol-toml` DoS Security Fix Plan

## Objective

Remove vulnerable `smol-toml` versions from the Dashin build toolchain before
the `2.0.0-alpha.8` release. This work is isolated from Phase 12 and does not
change runtime package APIs, package versions, npm tags, or downstream Jiazan
dependencies.

## Evidence and dependency boundary

- [GitHub advisory GHSA-7w5x-hrqm-74c2](https://github.com/advisories/GHSA-7w5x-hrqm-74c2)
  affects `smol-toml <=1.7.0`; `1.7.1` is the first patched release.
- Dashin receives `smol-toml@1.6.1` only through the development chain
  `lerna@9.0.7 -> nx@22.7.5 -> smol-toml`.
- The package is therefore a build-tool dependency rather than shipped browser
  runtime code, but the vulnerable resolution still fails the repository's
  security update check.

## Implementation

1. Add a root Yarn 1 `resolutions` entry for a patched `smol-toml` release.
2. Regenerate `yarn.lock` with Node 20 and Yarn 1.22.22.
3. Confirm `yarn why smol-toml` and the installed package metadata resolve only
   to the patched version.
4. Validate Nx/Lerna behavior through frozen install, the complete 23-package
   build, unit tests, E2E, and two consecutive template smoke runs.

## Acceptance gates

- `yarn install --frozen-lockfile`
- `yarn tsc:build`
- `yarn workspace @dashin-dev/dashin typecheck`
- Dashin, Payload, and D1 complete unit suites
- `yarn workspace @dashin-dev/dashin e2e`
- `npm run build --prefix docs`
- template smoke twice
- dependency resolution/audit checks and `git diff --check`
- GitHub CI and repository security checks reviewed on the PR

## Constraints

- No `2.0.0-alpha.8` publish, npm tag, or Git tag.
- No Jiazan dependency upgrade and no removal of its `_shared/api.ts` defense.
- No unrelated dependency upgrades or Phase 12 changes.
