const path = require("path")
const dashinPlugin = require("@dashin-dev/dashin/plugin")
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants")

module.exports = async phase => {
  /**
   * @type {import('next').NextConfig}
   */

  // Expose VITE_* env vars to the browser bundle (Next.js only auto-exposes
  // NEXT_PUBLIC_*; dashin core reads VITE_* via process.env).
  const viteEnv = Object.fromEntries(
    Object.entries(process.env).filter(([k]) => k.startsWith("VITE_"))
  )

  // Prepare before either compiler starts, never regenerate at next start.
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) await dashinPlugin({
    packagePath: path.resolve(__dirname, "package.json"),
    modulesPath: path.resolve(__dirname, "node_modules"),
    dynamicPath: path.resolve(__dirname, ".dashin/dynamic"),
    pluginsPath: path.resolve(__dirname, "plugins")
  })

  return {
    poweredByHeader: false,
    env: viteEnv,
    generateBuildId: async () => {
      return "dashin-" + require("./package.json").version
    },
    webpack: (config, { isServer }) => {
      /**
       * fix npm packages that depend on `fs` module
       */
      if (!isServer) {
        config.resolve.fallback.fs = false
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
