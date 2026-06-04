# Dashin

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
(Run in the plugin directory: plugins/bunadmin-plugin-[team]-[group]/)

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
- Password: `bunadmin`

[More details](https://dashin.dev/guide/demo)

## Screenshot

![Sign in](https://gblobscdn.gitbook.com/assets%2F-M1ZbjnBaWO_NJOdj8_A%2F-M6mhhE1-tUO_GCYLgQI%2F-M6miE4Tjmp-npJcYvYz%2Fsign-in.png)

![Blog Post](https://gblobscdn.gitbook.com/assets%2F-M1ZbjnBaWO_NJOdj8_A%2F-MHlKrSo5A7uYDJDV45k%2F-MHlKxF4-lohTzN3gsiA%2Fblog-post-strapi.png)

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
- Password: `bunadmin`

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
yarn turbo:tsc:build

npx lerna version --force-publish --no-git-tag-version
npx lerna publish from-package
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
...

❤️🎉
