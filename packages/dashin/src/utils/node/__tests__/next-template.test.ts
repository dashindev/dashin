import fs from "node:fs"
import path from "node:path"
import vm from "node:vm"
import { describe, expect, it, vi } from "vitest"

// Core tests are run from packages/dashin, including in CI.
const configPath = path.resolve(process.cwd(), "../dashin-cli/templates/typescript-nextjs/next.config.js")
const templateDir = path.dirname(configPath)

function loadConfig(prepare: (...args: any[]) => Promise<any>) {
  const module = { exports: undefined as any }
  vm.runInNewContext(fs.readFileSync(configPath, "utf8"), {
    module, __dirname: templateDir,
    process: { env: { VITE_AUTH_PLUGIN: "fixture-auth", PRIVATE_SECRET: "not-public" } },
    require: (name: string) => {
      if (name === "path") return path
      if (name === "next/constants") return { PHASE_DEVELOPMENT_SERVER: "phase-development-server", PHASE_PRODUCTION_BUILD: "phase-production-build" }
      if (name === "@dashin-dev/dashin/plugin") return prepare
      if (name === "./package.json") return { version: "fixture-version" }
      throw new Error(`Unexpected require: ${name}`)
    }
  }, { filename: configPath })
  return module.exports
}

describe("Next template plugin preparation", () => {
  it("supplies project paths and waits before returning webpack config", async () => {
    let finish!: () => void
    const prepare = vi.fn(() => new Promise<void>(resolve => { finish = resolve }))
    let settled = false
    const result = loadConfig(prepare)("phase-production-build").then((config: any) => { settled = true; return config })
    await Promise.resolve()
    expect(settled).toBe(false)
    expect(prepare).toHaveBeenCalledWith({
      packagePath: path.join(templateDir, "package.json"),
      modulesPath: path.join(templateDir, "node_modules"),
      dynamicPath: path.join(templateDir, ".dashin/dynamic"),
      pluginsPath: path.join(templateDir, "plugins")
    })
    finish()
    const config = await result
    expect(config.env).toEqual({ VITE_AUTH_PLUGIN: "fixture-auth" })
    expect(await config.generateBuildId()).toBe("dashin-fixture-version")
    for (const isServer of [false, true]) {
      const webpack = { resolve: { fallback: {} }, module: { rules: [] } }
      expect(config.webpack(webpack, { isServer })).toBe(webpack)
      if (!isServer) expect(webpack.resolve.fallback).toEqual({ fs: false })
    }
    expect(prepare).toHaveBeenCalledTimes(1)
  })

  it("rejects config loading when plugin preparation fails", async () => {
    const failure = new Error("Synthetic plugin preparation failure")
    await expect(loadConfig(async () => { throw failure })("phase-development-server")).rejects.toBe(failure)
  })

  it("does not regenerate imports when serving the production build", async () => {
    const prepare = vi.fn(async () => true)
    const config = await loadConfig(prepare)("phase-production-server")
    expect(typeof config.webpack).toBe("function")
    expect(prepare).not.toHaveBeenCalled()
  })
})
