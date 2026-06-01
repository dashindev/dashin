#!/usr/bin/env bash
# One-command bunadmin demo: Supabase (local via the Supabase CLI).
#
#   ./start.sh            # starts local Supabase (Docker) + seeds data on :54321
#
# Requires: Docker, npx (Node ≥ 20).
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# 1. Init + start local Supabase (Docker under the hood).
if [ ! -f "supabase/config.toml" ]; then
  echo "→ initializing Supabase project ..."
  npx supabase init
fi

echo "→ starting local Supabase (Docker) ..."
npx supabase start

DB_URL=$(npx supabase status -o json | grep -o '"DB_URL":"[^"]*"' | cut -d'"' -f4)
API_URL=$(npx supabase status -o json | grep -o '"API_URL":"[^"]*"' | cut -d'"' -f4)
ANON_KEY=$(npx supabase status -o json | grep -o '"ANON_KEY":"[^"]*"' | cut -d'"' -f4)

# 2. Seed tables + rows.
echo "→ seeding demo data ..."
psql "$DB_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft','published')),
  views int DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  in_stock boolean DEFAULT true
);
INSERT INTO posts (title, status, views) VALUES
  ('Hello World', 'published', 42),
  ('Getting Started with Bunadmin', 'published', 128),
  ('Draft Post', 'draft', 0);
INSERT INTO products (name, price, in_stock) VALUES
  ('Widget', 9.99, true),
  ('Gadget', 24.99, true),
  ('Thingamajig', 4.99, false);
SQL

cat <<EOF

✓ Local Supabase ready!  Studio: http://127.0.0.1:54323
  API URL:  ${API_URL}
  Anon key: ${ANON_KEY}

Next — in another terminal:
  bunadmin new my-admin && cd my-admin
  # .env:
  #   VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-supabase
  #   VITE_MAIN_URL=${API_URL}
  #   VITE_SUPABASE_KEY=${ANON_KEY}
  yarn dev

Stop with: npx supabase stop
EOF
