-- Dashin × Cloudflare D1 demo schema — an e-commerce store.
-- Run once after creating the D1 database:
--   npx wrangler d1 execute dashin-demo --remote --file=schema.sql -c wrangler.local.jsonc
-- (use --local to target the local miniflare D1 for development).
-- Seed data is owned by the Worker (src/index.ts SEED) and applied via the
-- 30-min reset cron or `POST /reset`; this file only defines the tables.

CREATE TABLE IF NOT EXISTS categories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT    NOT NULL,
  slug TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  price       REAL    NOT NULL DEFAULT 0,
  stock       INTEGER NOT NULL DEFAULT 0,
  status      TEXT    NOT NULL DEFAULT 'active',   -- active | draft | archived
  category_id INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS customers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  country    TEXT    NOT NULL DEFAULT 'US',
  created_at TEXT    NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL DEFAULT 1,
  total       REAL    NOT NULL DEFAULT 0,
  status      TEXT    NOT NULL DEFAULT 'pending',  -- pending | paid | shipped | cancelled
  created_at  TEXT    NOT NULL DEFAULT (date('now'))
);
