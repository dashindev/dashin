const bunadminPlugin = require("./plugin")

// run bunadmin scripts
const path = require("path")
const modulesPath = path.resolve(__dirname, "../../node_modules")
const dynamicPath = path.resolve(__dirname, "src/.bunadmin/dynamic")
const pluginsPath = path.resolve(__dirname, "src/private/plugins")
bunadminPlugin({ modulesPath, dynamicPath, pluginsPath })
