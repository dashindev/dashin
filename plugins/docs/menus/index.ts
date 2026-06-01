import { MenuType as Type } from "@dashin-dev/dashin"
import gettingStarted from "./getting-started"
import core from "./core"
import components from "./components"
import plugins from "./plugins"
import utils from "./utils"

const menus = [
  {
    id: "getting-started",
    name: "getting-started",
    label: "Getting Started",
    parent: "",
    rank: "100",
    icon_type: "eva",
    icon: "paper-plane-outline"
  },
  {
    id: "core",
    name: "core",
    label: "Core",
    parent: "",
    rank: "100",
    icon_type: "eva",
    icon: "cube-outline"
  },
  {
    id: "comp",
    name: "components",
    label: "Components",
    parent: "",
    rank: "100",
    icon_type: "eva",
    icon: "layers-outline"
  },
  {
    id: "plugins",
    name: "plugins",
    label: "Plugins",
    parent: "",
    rank: "100",
    icon_type: "eva",
    icon: "attach-outline"
  },
  {
    id: "utils",
    name: "utils",
    label: "Utils",
    parent: "",
    rank: "100",
    icon_type: "eva",
    icon: "browser-outline"
  },
  ...gettingStarted,
  ...core,
  ...components,
  ...plugins,
  ...utils
] as Type[]

export default menus
