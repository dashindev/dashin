import { defineConfig, loadEnv, Plugin } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

/**
 * Runs the bunadmin plugin generator before Vite scans the module graph, so
 * `src/.dashin/dynamic/**` exists when import.meta.glob (pluginRegistry) resolves.
 */
function bunadminGenerator(mode: string): Plugin {
  let ran = false
  const generate = () => {
    const env = loadEnv(mode, __dirname, "VITE_")
    for (const k of Object.keys(env)) process.env[k] = env[k]
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bunadminPlugin = require("@dashin-dev/dashin/plugin")
    return bunadminPlugin({
      packagePath: path.resolve(__dirname, "package.json"),
      modulesPath: path.resolve(__dirname, "node_modules"),
      dynamicPath: path.resolve(__dirname, "src/.dashin/dynamic"),
      pluginsPath: path.resolve(__dirname, "src/plugins")
    })
  }
  return {
    name: "bunadmin-generator",
    enforce: "pre",
    async buildStart() {
      await generate()
      ran = true
    },
    async configureServer() {
      if (!ran) {
        await generate()
        ran = true
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "VITE_")
  const define: Record<string, string> = {}
  for (const k of Object.keys(env)) {
    define[`process.env.${k}`] = JSON.stringify(env[k])
  }
  return {
    plugins: [bunadminGenerator(mode), react()],
    define,
    server: { port: 3000 },
    resolve: { alias: { "@": path.resolve(__dirname, "src") } }
  }
})
