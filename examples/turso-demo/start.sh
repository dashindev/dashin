#!/usr/bin/env bash
# One-command bunadmin demo: Turso / libSQL (local sqld via Docker).
#
#   ./start.sh            # starts sqld (libSQL HTTP) on :8080 + seeds data
#
# Requires: Docker, sqlite3 (for seeding).
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$DIR/.turso"
PORT="${TURSO_PORT:-8080}"

mkdir -p "$DB_DIR"

# 1. Seed a local SQLite file that sqld will serve.
echo "→ seeding demo data ..."
sqlite3 "$DB_DIR/data.db" <<'SQL'
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  views INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  in_stock INTEGER DEFAULT 1
);
INSERT INTO posts (title, status, views) VALUES
  ('Hello World', 'published', 42),
  ('Getting Started with Bunadmin', 'published', 128),
  ('Draft Post', 'draft', 0);
INSERT INTO products (name, price, in_stock) VALUES
  ('Widget', 9.99, 1),
  ('Gadget', 24.99, 1),
  ('Thingamajig', 4.99, 0);
SQL

# 2. Serve it via sqld (libSQL HTTP protocol).
echo "→ starting sqld (libSQL) on http://127.0.0.1:${PORT} ..."
docker run --rm -p "${PORT}:8080" \
  -v "$DB_DIR:/var/lib/sqld" \
  ghcr.io/tursodatabase/libsql-server:latest &
SQLD_PID=$!
trap 'kill $SQLD_PID 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1 && break
  sleep 0.5
done

cat <<EOF

✓ libSQL server ready: http://127.0.0.1:${PORT}

Next — in another terminal:
  bunadmin new my-admin && cd my-admin
  # .env:
  #   VITE_AUTH_PLUGIN=@dashin-dev/auth-local
  #   VITE_MAIN_URL=http://127.0.0.1:${PORT}
  yarn dev

(Ctrl-C here stops sqld.)
EOF

wait $SQLD_PID
