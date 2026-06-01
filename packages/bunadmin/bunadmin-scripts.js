const bunadminPlugin = require("./plugin")

// run bunadmin scripts
const path = require("path")
const packagePath = path.resolve(__dirname, "package.json")
const modulesPath = path.resolve(__dirname, "../../node_modules")
const dynamicPath = path.resolve(__dirname, "src/.dashin/dynamic")
const pluginsPath = path.resolve(__dirname, "src/private/plugins")
bunadminPlugin({ packagePath, modulesPath, dynamicPath, pluginsPath })
