const path = require("path")
const {
  useNextJsRouter
} = require("@dashin-dev/dashin/lib/utils/node/nextjs-handler")

const modulesPath = path.resolve(__dirname, "./node_modules")

useNextJsRouter(modulesPath)
