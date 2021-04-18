const { alias, configPaths } = require("react-app-rewire-alias")
require("./bunadmin-scripts")

module.exports = function override(config) {
  alias({
    ...configPaths("tsconfig.base.json")
  })(config)

  return config
}
