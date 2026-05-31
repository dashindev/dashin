/// <reference types="vitest" />
import { defineConfig, loadEnv, Plugin } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

/**
 * Runs the bunadmin plugin generator BEFORE Vite scans the module graph,
 * so `.bunadmin/dynamic/**` exists when import.meta.glob resolves.
 */
function bunadminGenerator(mode: string): Plugin {
  let ran = false
  const generate = () => {
    // Make VITE_ env available to the Node-side generator (loadEnv does not
    // populate process.env on its own).
    const env = loadEnv(mode, __dirname, "VITE_")
    for (const k of Object.keys(env)) process.env[k] = env[k]
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bunadminPlugin = require("./plugin")
    return bunadminPlugin({
      packagePath: path.resolve(__dirname, "package.json"),
      modulesPath: path.resolve(__dirname, "../../node_modules"),
      dynamicPath: path.resolve(__dirname, "src/.bunadmin/dynamic"),
      pluginsPath: path.resolve(__dirname, "src/private/plugins")
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

const r = (p: string) => path.resolve(__dirname, p)

export default defineConfig(({ mode }) => {
  // Inject the VITE_ env values that workspace plugin packages read via
  // `process.env.VITE_*` (they compile to CJS lib/ so can't use import.meta).
  const env = loadEnv(mode, __dirname, "VITE_")
  const define: Record<string, string> = {}
  for (const k of Object.keys(env)) {
    define[`process.env.${k}`] = JSON.stringify(env[k])
  }

  return {
    plugins: [bunadminGenerator(mode), react()],
    define,
    server: { port: 3000 },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules/, /\/lib\//]
      }
    },
    optimizeDeps: {
      include: ["@xbuilder/bunadmin-auth-local"]
    },
    resolve: {
      alias: {
        "@": r("src"),
        "@xbuilder/bunadmin-source-strapi": r("../bunadmin-source-strapi/index.ts"),
        "@xbuilder/bunadmin-source-graphql": r("../bunadmin-source-graphql/index.ts"),
        "@xbuilder/bunadmin-rich-text-editor": r("../bunadmin-rich-text-editor/index.tsx"),
        "@xbuilder/bunadmin-upload-strapi": r("../../plugins/bunadmin-upload-strapi/index.ts"),
        "@xbuilder/bunadmin": r("src")
      }
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      exclude: [
        "**/node_modules/**",
        "**/lib/**",
        "**/dist/**",
        "src/App.spec.tsx"
      ]
    }
  }
})

