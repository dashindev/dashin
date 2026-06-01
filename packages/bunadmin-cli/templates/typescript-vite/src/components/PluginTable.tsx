import React, { Suspense } from "react"
import {
  PluginTableProps,
  TableSkeleton,
  handlePluginPath
} from "@dashin-dev/dashin"
import { importPlugin, hasPlugin } from "../pluginRegistry"

function PluginTable({ team, group, name }: PluginTableProps) {
  const pluginPath = handlePluginPath({ team, group, name })

  const DynamicComponent = React.lazy(() =>
    hasPlugin(pluginPath)
      ? (importPlugin(pluginPath) as Promise<any>)
      : Promise.resolve({ default: () => null })
  )

  return (
    <div>
      <Suspense fallback={<TableSkeleton title={`${name} loading...`} />}>
        <DynamicComponent />
      </Suspense>
    </div>
  )
}

export default PluginTable
