---
layout: home
hero:
  name: Dashin
  text: AI-assisted admin, validated against your real schema
  tagline: A Vite + Tailwind React admin scaffold. Point it at your backend, let AI generate a validated admin — cheap models work because output is checked against your schema, not freeform code.
  image:
    src: /logo.svg
    alt: Dashin
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: AI Generation
      link: /ai/
    - theme: alt
      text: View on GitHub
      link: https://github.com/dashindev/dashin
features:
  - title: AI-assisted, validated
    details: "`ai generate` / `ai theme` / `ai refine` — the AI fills a constrained, validated contract, never freeform code. Cheap models work; bring your own key (OpenAI, Anthropic, or Ollama)."
  - title: Any backend
    details: Same table/CRUD UI on PocketBase, Appwrite, Supabase (Postgres), Directus, Payload, Turso/libSQL, Strapi, or GraphQL — swap via a data-source plugin.
  - title: Themeable design system
    details: Token-driven theming with light/dark presets and a slotted layout registry — a constrained design space the AI can compose into.
  - title: Everything is a plugin
    details: "Routes, menus, CRUD pages, and auth are plugins. Scaffold one with `dashin plugin [team]-[group]` and a schema with `dashin schema [name]`."
  - title: Vite-fast DX
    details: Instant HMR dev server, Vitest unit tests, and end-to-end TypeScript. Generate a project in seconds with `dashin new`.
  - title: Batteries included
    details: Permission control, multi-level menus, i18n, file management, notifications, and search / filter / sort are built in — call them from your plugin.
---
