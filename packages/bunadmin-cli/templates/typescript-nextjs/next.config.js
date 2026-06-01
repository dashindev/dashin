const path = require("path")
const dashinPlugin = require("@dashin-dev/dashin/plugin")

module.exports = () => {
  /**
   * @type {import('next').NextConfig}
   */

  return {
    poweredByHeader: false,
    generateBuildId: async () => {
      return "dashin-" + require("./package.json").version
    },
    webpack: (config, { isServer }) => {
      /**
       * fix npm packages that depend on `fs` module
       */
      if (!isServer) {
        config.resolve.fallback.fs = false
      } else {
        const modulesPath = path.resolve(__dirname, "./node_modules")
        const dynamicPath = path.resolve(__dirname, "./.dashin/dynamic")
        const pluginsPath = path.resolve(__dirname, "./plugins")
        dashinPlugin({ modulesPath, dynamicPath, pluginsPath })
      }
      /**
       * ignore
       */
      config.module.rules.push({
        test: /\.md$|LICENSE$|\.yml$|\.lock$|\.jpg$/,
        use: [{ loader: "ignore-loader" }]
      })

      return config
    }
  };
}
