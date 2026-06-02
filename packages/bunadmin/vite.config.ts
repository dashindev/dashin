/// <reference types="vitest" />
import { defineConfig, loadEnv, Plugin } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

/**
 * Runs the dashin plugin generator BEFORE Vite scans the module graph,
 * so `.dashin/dynamic/**` exists when import.meta.glob resolves.
 */
function dashinGenerator(mode: string): Plugin {
  let ran = false
  const generate = () => {
    // Make VITE_ env available to the Node-side generator (loadEnv does not
    // populate process.env on its own).
    const env = loadEnv(mode, __dirname, "VITE_")
    for (const k of Object.keys(env)) process.env[k] = env[k]
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dashinPlugin = require("./plugin")
    return dashinPlugin({
      packagePath: path.resolve(__dirname, "package.json"),
      modulesPath: path.resolve(__dirname, "../../node_modules"),
      dynamicPath: path.resolve(__dirname, "src/.dashin/dynamic"),
      pluginsPath: path.resolve(__dirname, "src/private/plugins")
    })
  }
  return {
    name: "dashin-generator",
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
  // Base process.env so dynamic lookups (process.env[`VITE_${key}`]) resolve in
  // the browser. VITE_ keys only (public); include NODE_ENV for libs that read it.
  define["process.env"] = JSON.stringify({ NODE_ENV: mode, ...env })

  return {
    plugins: [dashinGenerator(mode), react()],
    define,
    server: { port: 3000 },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules/, /\/lib\//]
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            redux: ["@reduxjs/toolkit", "react-redux"],
            dexie: ["dexie", "dexie-export-import"],
            tiptap: ["@tiptap/core", "@tiptap/react", "@tiptap/starter-kit"],
            i18n: ["i18next", "react-i18next"]
          }
        }
      }
    },
    optimizeDeps: {
      include: []
    },
    resolve: {
      alias: [
        { find: /^@\/(.*)/, replacement: r("src") + "/$1" },
        { find: "@", replacement: r("src") },
        // Map workspace packages to their TS source so Vite (dev + build) gets
        // clean ESM for both bare imports and deep subpaths (e.g. the generated
        // schema's `<pkg>/sign-in`). Avoids CJS lib/ interop issues.
        {
          find: /^@dashin-dev\/source-strapi$/,
          replacement: r("../bunadmin-source-strapi/index.ts")
        },
        {
          find: /^@dashin-dev\/source-graphql$/,
          replacement: r("../bunadmin-source-graphql/index.ts")
        },
        {
          find: /^@dashin-dev\/source-pocketbase$/,
          replacement: r("../bunadmin-source-pocketbase/index.ts")
        },
        {
          find: /^@dashin-dev\/source-appwrite$/,
          replacement: r("../bunadmin-source-appwrite/index.ts")
        },
        {
          find: /^@dashin-dev\/source-supabase$/,
          replacement: r("../bunadmin-source-supabase/index.ts")
        },
        {
          find: /^@dashin-dev\/source-directus$/,
          replacement: r("../bunadmin-source-directus/index.ts")
        },
        {
          find: /^@dashin-dev\/source-payload$/,
          replacement: r("../bunadmin-source-payload/index.ts")
        },
        {
          find: /^@dashin-dev\/source-turso$/,
          replacement: r("../bunadmin-source-turso/index.ts")
        },
        {
          find: /^@dashin-dev\/rich-text-editor$/,
          replacement: r("../bunadmin-rich-text-editor/index.tsx")
        },
        // dir-mapped: bare -> index.ts (Vite resolves), subpath -> source file
        {
          find: /^@dashin-dev\/auth-local\/(.*)/,
          replacement: r("../../plugins/auth-local") + "/$1"
        },
        {
          find: /^@dashin-dev\/auth-local$/,
          replacement: r("../../plugins/auth-local/index.ts")
        },
        {
          find: /^@dashin-dev\/auth-strapi\/(.*)/,
          replacement: r("../../plugins/auth-strapi") + "/$1"
        },
        {
          find: /^@dashin-dev\/auth-strapi$/,
          replacement: r("../../plugins/auth-strapi/index.ts")
        },
        {
          find: /^@dashin-dev\/auth-pocketbase\/(.*)/,
          replacement: r("../../plugins/auth-pocketbase") + "/$1"
        },
        {
          find: /^@dashin-dev\/auth-pocketbase$/,
          replacement: r("../../plugins/auth-pocketbase/index.ts")
        },
        {
          find: /^@dashin-dev\/upload-strapi\/(.*)/,
          replacement: r("../../plugins/upload-strapi") + "/$1"
        },
        {
          find: /^@dashin-dev\/upload-strapi$/,
          replacement: r("../../plugins/upload-strapi/index.ts")
        },
        { find: /^@dashin-dev\/dashin$/, replacement: r("src") }
      ]
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text-summary"],
        // Exclude non-logic glue / generated / type-only files from the metric.
        exclude: [
          "**/node_modules/**",
          "**/lib/**",
          "**/dist/**",
          "**/e2e/**",
          "**/__tests__/**",
          "**/*.d.ts",
          "**/.dashin/**",
          "src/setupTests.ts",
          "src/index.tsx",
          "src/main.ts"
        ]
      },
      exclude: [
        "**/node_modules/**",
        "**/lib/**",
        "**/dist/**",
        "**/e2e/**",
        "src/App.spec.tsx"
      ]
    }
  }
})
