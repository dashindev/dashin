import React, { Suspense } from "react"
import { PluginTableProps, TableSkeleton, handlePluginPath } from "../"

/**
 * !DO NOT export PluginTable in @xbuilder/bunadmin
 * Due to the dynamic import of aliases (@plugin)
 * PluginTable needs to be defined in each project.
 * @param team
 * @param group
 * @param name
 * @param hideLoading
 * @constructor
 */
export default function PluginTable({ team, group, name }: PluginTableProps) {
  const pluginPath = handlePluginPath({ team, group, name })

  /**
   * Load plugin that override or customize
   */
  let CustomPlugin
  try {
    CustomPlugin = require(`./plugins/${pluginPath}`)
    CustomPlugin = CustomPlugin.default
  } catch (e) {}

  const Plugin = CustomPlugin || DynamicPlugin

  const DynamicComponent = React.lazy(() =>
    import(`../.bunadmin/dynamic/${pluginPath}`)
  )

  function DynamicPlugin() {
    return (
      <div>
        <Suspense fallback={<TableSkeleton title={`${name} loading...`} />}>
          <DynamicComponent />
        </Suspense>
      </div>
    )
  }

  return <Plugin />
}
