#!/usr/bin/env bash
# One-command bunadmin flagship demo: PocketBase + seed + a generated admin.
#
#   ./start.sh            # downloads PocketBase, seeds it, serves on :8090
#
# Then in another terminal, scaffold + run the admin (see README.md).
set -euo pipefail

PB_VERSION="${PB_VERSION:-0.22.21}"
PB_PORT="${PB_PORT:-8090}"
DIR="$(cd "$(dirname "$0")" && pwd)"
PB_DIR="$DIR/.pb"
ADMIN_EMAIL="${PB_ADMIN:-admin@bunadmin.test}"
ADMIN_PW="${PB_ADMIN_PW:-bunadmin123}"

mkdir -p "$PB_DIR"
cd "$PB_DIR"

# 1. Download PocketBase binary if missing (Linux x64; see README for other OS).
if [ ! -x "./pocketbase" ]; then
  echo "→ downloading PocketBase $PB_VERSION ..."
  url="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip"
  curl -fsSL "$url" -o pb.zip
  unzip -o pb.zip pocketbase >/dev/null
  rm -f pb.zip
fi

# 2. Create the admin account (idempotent — ignores "already exists").
./pocketbase admin create "$ADMIN_EMAIL" "$ADMIN_PW" 2>/dev/null || true

# 3. Serve in the background, wait for health.
echo "→ starting PocketBase on http://127.0.0.1:${PB_PORT} ..."
./pocketbase serve --http="127.0.0.1:${PB_PORT}" >pb.log 2>&1 &
PB_PID=$!
trap 'kill $PB_PID 2>/dev/null || true' EXIT
for i in $(seq 1 30); do
  curl -fsS "http://127.0.0.1:${PB_PORT}/api/health" >/dev/null 2>&1 && break
  sleep 0.5
done

# 4. Seed demo collections + records + a demo user.
echo "→ seeding demo data ..."
PB_URL="http://127.0.0.1:${PB_PORT}" PB_ADMIN="$ADMIN_EMAIL" PB_ADMIN_PW="$ADMIN_PW" \
  node "$DIR/../../docs/pocketbase/seed.js"

cat <<EOF

✓ Demo backend ready: http://127.0.0.1:${PB_PORT}  (admin UI: /_/)
  admin: ${ADMIN_EMAIL} / ${ADMIN_PW}   demo user: demo / bunadmin123

Next — in another terminal:
  bunadmin new my-admin && cd my-admin
  # .env:
  #   VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-pocketbase
  #   VITE_AUTH_URL=http://127.0.0.1:${PB_PORT}
  bunadmin ai generate --url http://127.0.0.1:${PB_PORT} --collection posts \\
    --token \$(curl -s -X POST http://127.0.0.1:${PB_PORT}/api/admins/auth-with-password \\
      -H 'Content-Type: application/json' \\
      -d '{"identity":"${ADMIN_EMAIL}","password":"${ADMIN_PW}"}' | sed -n 's/.*"token":"\\([^"]*\\)".*/\\1/p')
  yarn dev

(Ctrl-C here stops PocketBase.)
EOF

wait $PB_PID
