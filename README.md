# Dashin

![Dashin — the plugin-based React admin scaffold](assets/banner.png)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-dashin.dev-00d68f.svg)](https://dashin.dev)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dashindev/dashin/pulls)

**Dashin** is a scaffold to quickly build a `React` background management system. It is easy to use and can help you build a powerful background management panel. The app is powered by **Vite**, styled with **Tailwind CSS** + **Headless UI**, and uses **TipTap** for rich-text editing. If you have not used these before, don't worry — you can learn them quickly during actual use.

Dashin hopes to achieve as many function reuse as possible through simple development methods, so in each Dashin project, **common functions have been built**, such as dynamic routing, multi-level menus, **permission control, data management**, search filtering and sorting, CRUD, **file management, message notification**, documenting your code, etc. You only need to build your own plugin to call it, and the Dashin plugin is also easy to learn and use.

## Quick start

```
npm install --global @dashin-dev/cli
dashin new my-dashin
```

Create a plugin
`$ dashin plugin [team]-[group]`
(Run in the plugins directory: plugins/)

Create a schema
`$ dashin schema [name]`
(Run in the plugin directory: plugins/dashin-plugin-[team]-[group]/)

Display help for command
`$ dashin --help`

[Read the Getting Started tutorial](https://dashin.dev/guide/getting-started)

## AI-assisted generation (BYOK)

Point Dashin at your backend and let AI generate a **validated** admin — cheap
models work because output is checked against your real schema, not freeform code.

```
# schema -> validated admin table
dashin ai generate --url <backend-url> --collection <name> --token <admin>

# description -> validated theme
dashin ai theme "dark mode with a purple accent"
```

Bring your own key: set `DASHIN_AI_PROVIDER` (openai | anthropic | ollama) +
`DASHIN_AI_API_KEY`. Full guide: [`docs/ai/README.md`](docs/ai/README.md).

## Backend connectors

Swap data sources via plugins — same table/CRUD UI on any backend:
**PocketBase** (`@dashin-dev/source-pocketbase`), **Appwrite**
(`@dashin-dev/source-appwrite`), **Strapi**, **GraphQL**.
See [`docs/pocketbase/`](docs/pocketbase/).

## Online demo

[dashin.dev](https://dashin.dev/)

- Username: `admin`
- Password: `dashin`

[More details](https://dashin.dev/guide/demo)

## Development

```shell script
git clone git@github.com:dashindev/dashin.git

yarn
yarn tsc:build        # required once — builds all package lib/ for the plugin generator
yarn tsc:watch
yarn dev

# minimum command
$ yarn workspace @dashin-dev/dashin tsc:watch
$ yarn workspace @dashin-dev/auth-local tsc:watch

$ yarn dev
```

The dev server (Vite) runs at [http://localhost:3000](http://localhost:3000).

- Username: `admin`
- Password: `dashin`

### Scripts

Inside `packages/dashin`:

| Command          | Description           |
| ---------------- | --------------------- |
| `yarn dev`       | Vite dev server       |
| `yarn build`     | Vite production build |
| `yarn test`      | Vitest                |
| `yarn typecheck` | tsc app type-check    |

From the repo root:

| Command                | Description                |
| ---------------------- | -------------------------- |
| `yarn tsc:build`       | Build all packages (lerna) |
| `yarn turbo:tsc:build` | Build all packages (turbo) |

## Lerna (publish packages)

```
yarn tsc:build        # build all package lib/ first (publish ships lib/, not src)

# First 2.0 release is an alpha — publish under the `alpha` dist-tag so it
# doesn't take the default `latest` tag:
npx lerna publish from-package --dist-tag alpha

# Later, to cut a stable release:
#   npx lerna version 2.0.0 --no-private
#   npx lerna publish from-git
```

#### Thanks

[tailwindcss](https://github.com/tailwindlabs/tailwindcss)
[headlessui](https://github.com/tailwindlabs/headlessui)
[tiptap](https://github.com/ueberdosis/tiptap)
[vite](https://github.com/vitejs/vite)
[formik](https://github.com/jaredpalmer/formik)
[ngx-admin](https://github.com/akveo/ngx-admin)
[ant-design-pro](https://github.com/ant-design/ant-design-pro)
[react-admin](https://github.com/marmelab/react-admin)

❤️🎉
