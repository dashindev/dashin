# Getting Started

Dashin is a scaffold for building React admin/back-office apps quickly. It's
powered by **Vite**, styled with **Tailwind CSS + Headless UI**, uses **TipTap**
for rich text, and ships an **AI-assisted, schema-validated** generation flow.

## Install & scaffold

```bash
npm install --global dashin-cli
dashin new my-admin
cd my-admin
yarn && yarn dev
```

The dev server runs at http://localhost:3000.

## Core commands

| Command | Description |
| --- | --- |
| `dashin new <name>` | Create a project (Vite template) |
| `dashin plugin [team]-[group]` | Create a plugin (run in `plugins/`) |
| `dashin schema [name]` | Create a schema (run in a plugin dir) |
| `dashin ai generate` | Generate a validated admin table from a backend ([AI guide](/ai/)) |
| `dashin ai theme` | Generate a validated theme from a description |
| `dashin ai refine` | Refine an existing generated admin via natural language |

## Pick a backend

Dashin is backend-agnostic — choose a data-source connector:

- [PocketBase](/pocketbase/)
- [Appwrite](/appwrite/)
- [Supabase / Postgres](/supabase/)

…or Strapi / GraphQL. Set `VITE_AUTH_PLUGIN` + `VITE_AUTH_URL` in `.env` and the
same table/CRUD UI works against your data.

## Next

- [AI-assisted generation](/ai/) — the fastest way to a working admin.
- [Flagship demo](/guide/demo) — one command: backend + seed + generated admin.
