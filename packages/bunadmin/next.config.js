const path = require("path")
const bunadminPlugin = require("./plugin")
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/
})

module.exports = () => {
  return withMDX({
    poweredByHeader: false,
    generateBuildId: async () => {
      return "bunadmin-" + require("./package.json").version
    },
    webpack: (config, { isServer }) => {
      /**
       * fix npm packages that depend on `fs` module
       */
      if (!isServer) {
        config.node = {
          fs: "empty"
        }
      } else {
        const packagePath = path.resolve(__dirname, "package.json")
        const dynamicPath = path.resolve(__dirname, ".bunadmin/dynamic")
        const pluginsPath = path.resolve(__dirname, "src/private/plugins")
        bunadminPlugin({ packagePath, dynamicPath, pluginsPath })
      }
      /**
       * alias
       */
      config.resolve.alias["@"] = path.resolve(__dirname, "src")
      config.resolve.alias["@xbuilder/bunadmin"] = path.resolve(
        __dirname,
        "src"
      )
      /**
       * ignore
       */
      config.module.rules.push({
        test: [/\.md$/, /LICENSE$/, /\.yml$/, /\.lock$/, /\.tgz$/, /\.d\.ts$/],
        use: [{ loader: "ignore-loader" }]
      })

      return config
    }
  })
}
