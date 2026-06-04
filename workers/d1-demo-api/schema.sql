-- Dashin × Cloudflare D1 demo schema.
-- Run once after creating the D1 database:
--   npx wrangler d1 execute dashin-demo --remote --file=schema.sql
-- (use --local to target the local miniflare D1 for development).
-- Seed data is owned by the Worker (src/index.ts SEED) and applied via the
-- 30-min reset cron or `POST /reset`; this file only defines the tables.

CREATE TABLE IF NOT EXISTS posts (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  title  TEXT    NOT NULL,
  status TEXT    NOT NULL DEFAULT 'draft',
  views  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT    NOT NULL,
  price    REAL    NOT NULL DEFAULT 0,
  in_stock INTEGER NOT NULL DEFAULT 1
);
