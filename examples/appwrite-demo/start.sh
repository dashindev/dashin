#!/usr/bin/env bash
# One-command bunadmin demo: Appwrite (self-hosted via Docker).
#
#   ./start.sh            # starts Appwrite on :8080
#
# Requires: Docker.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "→ starting Appwrite (Docker) on http://127.0.0.1:8080 ..."
docker compose up -d

echo "→ waiting for Appwrite to be healthy ..."
for i in $(seq 1 60); do
  curl -fsS "http://127.0.0.1:8080/v1/health" >/dev/null 2>&1 && break
  sleep 1
done

cat <<EOF

✓ Appwrite ready: http://127.0.0.1:8080/console

Next steps (one-time, in the Appwrite console):
  1. Create an account + project, note the Project ID.
  2. Create a database (note its ID) and a 'posts' collection with
     attributes: title (string), status (string), views (integer).
  3. Set collection permissions to allow your user to read/write.

Then — in another terminal:
  bunadmin new my-admin && cd my-admin
  # .env:
  #   VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-appwrite
  #   VITE_AUTH_URL=http://127.0.0.1:8080
  #   VITE_APPWRITE_PROJECT=<your-project-id>
  #   VITE_APPWRITE_DATABASE=<your-database-id>
  yarn dev

Stop with: docker compose down
EOF
