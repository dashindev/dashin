// @ts-nocheck — Vite-only: import.meta.glob is not valid under the CJS tsc build.
import React, { Suspense } from "react"
import { PluginTableProps, TableSkeleton, handlePluginPath } from "../"
import { importPlugin, hasPlugin } from "@/utils/pluginRegistry"

// Local override/customized plugins (src/private/plugins/**).
const overrides = import.meta.glob("./plugins/**/index.{ts,tsx}")

/**
 * !DO NOT export PluginTable in @xbuilder/bunadmin
 * Due to the dynamic import of plugins, PluginTable needs to be defined
 * in each project.
 */
export default function PluginTable({ team, group, name }: PluginTableProps) {
  const pluginPath = handlePluginPath({ team, group, name })

  // Prefer a local override; else fall back to the generated dynamic plugin.
  const overrideKey = `./plugins/${pluginPath}/index.tsx`
  const overrideKeyTs = `./plugins/${pluginPath}/index.ts`
  const overrideLoader = overrides[overrideKey] || overrides[overrideKeyTs]

  const DynamicComponent = React.lazy(() =>
    overrideLoader
      ? (overrideLoader() as Promise<any>)
      : hasPlugin(pluginPath)
      ? importPlugin(pluginPath)
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
