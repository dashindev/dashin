#!/usr/bin/env bash
# Deploy command for Cloudflare Workers Builds (git-integrated CI deploy).
#
# The committed wrangler.jsonc carries a PLACEHOLDER D1 database_id so no
# account-specific value lives in git. This script injects the real id from the
# build-time `D1_DATABASE_ID` variable (set it in the Workers Builds project's
# Variables — never committed) into a generated config, then deploys.
#
# Workers Builds settings for this Worker:
#   Root directory:  workers/d1-demo-api
#   Build command:   npm install
#   Deploy command:  bash scripts/ci-deploy.sh
#   Variables:       D1_DATABASE_ID = <your dashin-demo D1 id>
set -euo pipefail

: "${D1_DATABASE_ID:?set D1_DATABASE_ID in the Workers Builds project variables}"

sed "s/REPLACE_WITH_YOUR_D1_DATABASE_ID/${D1_DATABASE_ID}/" wrangler.jsonc > wrangler.ci.jsonc
npx wrangler deploy -c wrangler.ci.jsonc
