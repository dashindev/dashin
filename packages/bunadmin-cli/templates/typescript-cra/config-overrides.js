const bunadminPlugin = require("@xbuilder/bunadmin/plugin")

module.exports = function override(config) {
  // run bunadmin scripts
  const path = require("path")
  const modulesPath = path.resolve(__dirname, "./node_modules")
  const dynamicPath = path.resolve(__dirname, "./src/.bunadmin/dynamic")
  const pluginsPath = path.resolve(__dirname, "./src/plugins")
  bunadminPlugin({ modulesPath, dynamicPath, pluginsPath })

  return config
}
