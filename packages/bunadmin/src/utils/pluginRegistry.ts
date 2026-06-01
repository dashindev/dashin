// @ts-nocheck — import.meta.glob is Vite-only and is invalid under this package's
// CJS `tsc:build` (module: commonjs). The app is type-checked separately via
// `yarn typecheck` (tsconfig.app.json, module: esnext). Vite builds this from source.
/**
 * Vite plugin registry — replaces webpack-era dynamic require()/import(`${var}`)
 * with statically-analyzable import.meta.glob maps. The generated
 * `.dashin/dynamic/` tree is produced by the bunadmin generator (run in
 * vite.config buildStart) before these globs resolve.
 */

// Generated auth-plugin index (eager: needed synchronously at init).
const indexEager = import.meta.glob("../.dashin/dynamic/index.js", {
  eager: true
})
// Generated custom-plugins data (eager).
const pluginsDataTs = import.meta.glob("../.dashin/dynamic/pluginsData.ts", {
  eager: true
})
const pluginsDataJson = import.meta.glob(
  "../.dashin/dynamic/pluginsData.json",
  { eager: true }
)
// Per-plugin schema modules (lazy: code-split).
const dynamicLazy = import.meta.glob("../.dashin/dynamic/**/*/index.js")

// Plugin i18n bundles, consumed synchronously by addResource via requirePlugin.
// They live in the plugin packages' source (utils/i18n/{lan}.ts).
const pluginI18n = import.meta.glob(
  "../../../plugins/*/utils/i18n/*.{ts,tsx}",
  { eager: true }
)

const first = (m: Record<string, any>) => Object.values(m)[0] as any
const lazyKey = (p: string) => `../.dashin/dynamic/${p}/index.js`

/** The generated auth-plugin map: { [pluginName]: module }. */
export function getDynamicIndex(): Record<string, any> {
  const mod = first(indexEager)
  return (mod && mod.default) || {}
}

export function getPluginsDataJson(): any[] {
  const mod = first(pluginsDataJson)
  return (mod && mod.default) || []
}

export function getPluginsDataTs(): any[] {
  const mod = first(pluginsDataTs)
  return (mod && mod.data) || []
}

/**
 * Async, code-split lookup of a dynamic plugin module.
 * Replaces `import(`../.dashin/dynamic/${path}`)` and `require(`./plugins/...`)`.
 */
export function importPlugin(path: string): Promise<any> {
  const loader = dynamicLazy[lazyKey(path)]
  return loader
    ? (loader() as Promise<any>)
    : Promise.reject(new Error(`plugin module not found: ${path}`))
}

/** Whether a dynamic plugin module exists (sync check against the glob map). */
export function hasPlugin(path: string): boolean {
  return !!dynamicLazy[lazyKey(path)]
}

/**
 * Sync resolver for plugin i18n bundles (replaces the old require() in
 * addResource). `path` looks like `bunadmin-auth-local/utils/i18n/en` or
 * `bunadmin-plugin-team-group/utils/i18n/en`.
 */
export function requirePlugin(path: string): any {
  // Match the trailing `<plugin>/utils/i18n/<lan>` against the glob keys,
  // which are like `../../../plugins/<plugin>/utils/i18n/<lan>.ts`.
  const match = Object.keys(pluginI18n).find(k =>
    k.includes(`/${path}.`) || k.includes(`/${path}`)
  )
  return match ? (pluginI18n[match] as any) : null
}
