const bunadminPlugin = require("./plugin")

// run bunadmin scripts
const path = require("path")
const packagePath = path.resolve(__dirname, "package.json")
const dynamicPath = path.resolve(__dirname, "src/.bunadmin/dynamic")
const pluginsPath = path.resolve(__dirname, "src/private/plugins")
bunadminPlugin({ packagePath, dynamicPath, pluginsPath })
