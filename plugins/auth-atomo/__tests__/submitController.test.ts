import { describe, it, expect, vi, afterEach } from "vitest"
const captured = vi.hoisted(() => ({ options: null as any }))
vi.mock("@dashin-dev/dashin", () => ({ completeSignIn: async (options: any) => { captured.options = options } }))
vi.mock("../sign-in/services/signInService", () => ({ default: vi.fn() }))
import submitController from "../sign-in/controllers/submitController"

afterEach(() => vi.unstubAllGlobals())
describe("Atomo token compensation", () => {
  it.each([null, "old-token"])("restores both prior token keys (%s) after a partial write", async oldToken => {
    const values = new Map<string, string>(oldToken ? [["token", oldToken], ["atomo_auth_token", oldToken]] : [])
    let fail = true
    vi.stubGlobal("window", {})
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { if (key === "token" && fail) { fail = false; throw new Error("Quota") }; values.set(key, value) },
      removeItem: (key: string) => values.delete(key)
    })
    await submitController({ t: ((key: string) => key) as any, values: {} as any, setSubmitting: vi.fn() })
    expect(() => captured.options.afterPersist({ token: "new-token" })).toThrow("Quota")
    captured.options.rollbackPersist()
    expect(values.get("token") ?? null).toBe(oldToken)
    expect(values.get("atomo_auth_token") ?? null).toBe(oldToken)
  })
})
