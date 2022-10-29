import React, { Suspense } from "react"
import {
  PluginTableProps,
  TableSkeleton,
  handlePluginPath
} from "@xbuilder/bunadmin"

function PluginTable({ team, group, name }: PluginTableProps) {
  const pluginPath = handlePluginPath({ team, group, name })

  /**
   * Load plugin that override or customize
   */
  let CustomPlugin
  try {
    CustomPlugin = require(`../plugins/${pluginPath}`)
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

export default PluginTable
