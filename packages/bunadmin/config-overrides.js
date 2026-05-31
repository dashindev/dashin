const { alias, configPaths } = require("react-app-rewire-alias")
const path = require("path")
require("./bunadmin-scripts")

module.exports = function override(config) {
  alias({
    ...configPaths("tsconfig.base.json")
  })(config)

  // CRA4/webpack4 excludes node_modules from babel. Some deps (e.g. the
  // @tanstack packages pulled in by @headlessui/react) ship modern ESM
  // (nullish-coalescing) that must be transpiled to parse.
  config.module.rules.push({
    test: /\.m?js$/,
    include: /node_modules[\\/]@tanstack/,
    use: {
      loader: require.resolve("babel-loader"),
      options: {
        presets: [require.resolve("babel-preset-react-app")],
        plugins: [
          require.resolve("@babel/plugin-proposal-nullish-coalescing-operator"),
          require.resolve("@babel/plugin-proposal-optional-chaining")
        ]
      }
    }
  })

  return config
}
