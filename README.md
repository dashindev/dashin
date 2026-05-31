# BunAdmin

**Bunadmin** is a scaffold to quickly build a `React` background management system. It is easy to use and can help you build a powerful background management panel. Techniques that need to be familiar **only include** `Tailwind CSS` and `Headless UI`, if you have not used it before, don’t worry, you can spend very little time learning in actual use later.

Bunadmin hopes to achieve as many function reuse as possible through simple development methods, so in each bunadmin project, **common functions have been built**, such as dynamic routing, multi-level menus, **permission control, data management**, search filtering and sorting, CRUD, **file management, message notification**, documenting your code, etc. You only need to build your own plugin to call it, and the bunadmin plugin is also easy to learn and use.

## Quick start

```
npm install --global bunadmin-cli
bunadmin new my-bunadmin
```

Create a plugin
`$ bunadmin plugin [team]-[group]`
(Run in the plugins directory: plugins/)

Create a schema
`$ bunadmin schema [name]`
(Run in the plugin directory: plugins/bunadmin-plugin-[team]-[group]/)

Display help for command
`$ bunadmin --help`

[Read the Getting Started tutorial](http://blog.eg.bunadmin.com/docs/getting-started/introduction)

## Online demo

[blog.eg.bunadmin.com](http://blog.eg.bunadmin.com/)

- Username: `admin`
- Password: `bunadmin`

[More details](http://blog.eg.bunadmin.com/docs/getting-started/remote-data)

## Screenshot

![Sign in](https://gblobscdn.gitbook.com/assets%2F-M1ZbjnBaWO_NJOdj8_A%2F-M6mhhE1-tUO_GCYLgQI%2F-M6miE4Tjmp-npJcYvYz%2Fsign-in.png)

![Blog Post](https://gblobscdn.gitbook.com/assets%2F-M1ZbjnBaWO_NJOdj8_A%2F-MHlKrSo5A7uYDJDV45k%2F-MHlKxF4-lohTzN3gsiA%2Fblog-post-strapi.png)

## Development

```shell script
git clone git@github.com:xbuilder/bunadmin.git

yarn
yarn tsc:watch
yarn dev

# minium command
$ yarn workspace @xbuilder/bunadmin tsc:watch
$ yarn workspace @xbuilder/bunadmin-auth-local tsc:watch

$ yarn dev
```

[http://localhost:3000](http://localhost:3000)

- Username: `admin`
- Password: `bunadmin`

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
[next.js](https://github.com/zeit/next.js)
[formik](https://github.com/jaredpalmer/formik)
[ngx-admin](https://github.com/akveo/ngx-admin)
[ant-design-pro](https://github.com/ant-design/ant-design-pro)
[react-admin](https://github.com/marmelab/react-admin)
...

❤️🎉
