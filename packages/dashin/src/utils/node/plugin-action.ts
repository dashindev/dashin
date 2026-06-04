import FileHound from "filehound"
import { PluginData } from "@/utils"
import * as fs from "fs"

/**
 * NODE MODULE
 * Find active plugins' paths under the [paths]
 * @param paths {string}
 */
export function findPlugins(paths: string): string[] {
  let activePlugins: string[] =
    FileHound.create()
      .paths(paths)
      .depth(1)
      .directory()
      // @ts-ignore
      .match(["auth-*", "upload-*", "dashin-plugin-*"])
      .findSync() || []

  /**
   * Handle duplicate auth plugins (keep one)
   * @type {number}
   */
  const countAuth = (
    activePlugins.find(item => /\/auth-/g.test(item)) || []
  ).length
  const AUTH_PLUGIN =
    process.env.VITE_AUTH_PLUGIN ||
    process.env.REACT_APP_AUTH_PLUGIN ||
    process.env.NEXT_PUBLIC_AUTH_PLUGIN
  if (countAuth > 1) {
    const newArr: string[] = []
    activePlugins.map(item => {
      if (
        (AUTH_PLUGIN && item.indexOf(AUTH_PLUGIN) > -1) ||
        item.indexOf("/auth-") < 0
      ) {
        newArr.push(item)
      }
    })
    activePlugins = newArr
  }

  /**
   * Handle ignored plugins
   */
  let ignoredArr: any[] = []
  const IGNORED_PLUGINS =
    process.env.VITE_IGNORED_PLUGINS ||
    process.env.REACT_APP_IGNORED_PLUGINS ||
    process.env.NEXT_PUBLIC_IGNORED_PLUGINS
  if (IGNORED_PLUGINS) {
    ignoredArr = IGNORED_PLUGINS.split(/[ ,]+/)
  }
  ignoredArr.map(item => {
    const ignoredRegx = new RegExp(item, "g")
    const ignoreIndex = activePlugins.findIndex(item => ignoredRegx.test(item))
    delete activePlugins[ignoreIndex]
  })

  activePlugins = activePlugins.map(item => item)

  return activePlugins
}

/**
 * NODE MODULE
 * Get plugin names from package.json
 */
export function getPluginNames(packageJson: string): string[] {
  const b = fs.readFileSync(packageJson)

  let pluginNames: string[] = []

  try {
    const content = b.toString()
    const obj: {
      dependencies?: { [k: string]: string }
      devDependencies?: { [k: string]: string }
    } = JSON.parse(content)

    const allDeps = { ...obj.dependencies, ...obj.devDependencies }
    pluginNames = Object.keys(allDeps).filter(k => {
      const matchPlugins = [
        "@dashin-dev/auth",
        "@dashin-dev/upload",
        "dashin-plugin"
      ]

      for (let index = 0; index < matchPlugins.length; index++) {
        const r = matchPlugins[index]
        if (k.indexOf(r) > -1) return true
      }
    })

    if (pluginNames.length == 0)
      console.warn(
        "you should add at least one dashin plugin in your dependencies"
      )

    return pluginNames
  } catch (error) {
    console.error("failed to get plugin names", error)
    return []
  }
}

/**
 * NODE MODULE
 * Get plugins data from package.json
 * @param paths
 */

export function getPlugins(pluginNames: string[]): PluginData[] {
  // Get plugin data in each plugin initData
  let pluginsData: PluginData[] = []
  for (let index = 0; index < pluginNames.length; index++) {
    const pluginName = pluginNames[index]
    let plugin
    try {
      plugin = require("" + pluginName)
      if (!plugin || !plugin.initData || !plugin.initData.data) continue
      pluginsData = [...pluginsData, ...plugin.initData.data]
    } catch (e) {
      console.error(
        "cannot find 'initData' in the plugin, please export or check: " +
          pluginName
      )
      console.error(e)
    }
  }

  return pluginsData
}
