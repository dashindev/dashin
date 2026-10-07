import { describe, it, expect, vi, beforeEach } from "vitest"

// Keep the suite free of Dexie/store side effects: both are injected.
vi.mock("@/core/notice/controllers/noticeController", () => ({
  default: vi.fn()
}))
vi.mock("@/utils/database", () => ({ BA_DB: {} }))

import { completeSignIn, signInErrorMessage } from "../signIn"

const t = ((k: string) => k) as any

/** Minimal fake of the Dexie surface the helper uses. */
function fakeDb() {
  const users: any[] = []
  const settings: any[] = []
  const txImpl = vi.fn(async (_mode: string, _t1: any, _t2: any, fn: () => Promise<void>) => {
    const userLength = users.length, settingLength = settings.length
    try { await fn() } catch (error) {
      users.splice(userLength); settings.splice(settingLength)
      throw error
    }
  })
  return {
    users: { put: vi.fn(async (row: any) => { users.push(row); return row.id }) },
    settings: { put: vi.fn(async (row: any) => { settings.push(row); return row.name }) },
    transaction: txImpl,
    _users: users,
    _settings: settings
  } as any
}

const goodResult = {
  id: "u1",
  token: "tok-1",
  user: { username: "admin@x.io", role: "admin" }
}

describe("signInErrorMessage", () => {
  it("extracts nested/flat messages and falls back", () => {
    expect(signInErrorMessage({ errors: "Bad credentials" })).toBe("Bad credentials")
    expect(
      signInErrorMessage({ errors: [{ data: { errors: [{ message: "Email taken" }] } }] })
    ).toBe("Email taken")
    expect(signInErrorMessage({ message: "Denied" })).toBe("Denied")
    expect(signInErrorMessage(new Error("Network Error"))).toBe("Network Error")
    expect(signInErrorMessage({})).toBe("Sign in failed")
    expect(signInErrorMessage({}, "Sign up failed")).toBe("Sign up failed")
  })
})

describe("completeSignIn", () => {
  it("a failed success notice does not misreport committed authentication", async () => {
    const db = fakeDb(), navigate = vi.fn()
    expect(await completeSignIn({ t, db, navigate, signIn: async () => goodResult,
      notify: async () => { throw new Error("Notice unavailable") }
    })).toBe(true)
    expect(db._users).toHaveLength(1)
    expect(navigate).toHaveBeenCalledOnce()
  })
  it("rolls identity and external storage back when the token hook fails", async () => {
    const db = fakeDb(), notify = vi.fn(), navigate = vi.fn(), rollbackPersist = vi.fn()
    expect(await completeSignIn({ t, db, notify, navigate,
      signIn: async () => goodResult,
      afterPersist: async () => { throw new Error("Token storage unavailable") }, rollbackPersist
    })).toBe(false)
    expect(db._users).toHaveLength(0)
    expect(db._settings).toHaveLength(0)
    expect(rollbackPersist).toHaveBeenCalledOnce()
    expect(navigate).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }))
  })

  it("settles rejection even when the notice sink also rejects", async () => {
    const setSubmitting = vi.fn()
    await expect(completeSignIn({ t, db: fakeDb(), setSubmitting,
      signIn: async () => { throw new Error("Offline") },
      notify: async () => { throw new Error("Notice storage failed") }
    })).resolves.toBe(false)
    expect(setSubmitting).toHaveBeenCalledWith(false)
  })

  it.each([true, 123, " "])("rejects invalid token %s", async token => {
    const db = fakeDb()
    expect(await completeSignIn({ t, db, notify: vi.fn(), navigate: vi.fn(),
      signIn: async () => ({ ...goodResult, token: token as any })
    })).toBe(false)
    expect(db._users).toHaveLength(0)
  })
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("persists identity atomically, notifies and navigates on success", async () => {
    const db = fakeDb()
    const notify = vi.fn()
    const navigate = vi.fn()
    const afterPersist = vi.fn()
    const setSubmitting = vi.fn()

    const ok = await completeSignIn({
      t,
      signIn: async () => goodResult,
      setSubmitting,
      db,
      notify,
      afterPersist,
      navigate
    })

    expect(ok).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
    expect(db.users.put).toHaveBeenCalledWith(
      expect.objectContaining({ username: "admin@x.io", token: "tok-1", role: "admin", id: "u1" })
    )
    expect(db.settings.put).toHaveBeenCalledWith(
      expect.objectContaining({ name: "username", value: "admin@x.io" })
    )
    expect(db.settings.put).toHaveBeenCalledWith(
      expect.objectContaining({ name: "role", value: "admin" })
    )
    expect(afterPersist).toHaveBeenCalledWith(goodResult)
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ title: "Sign in successful" }))
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(setSubmitting).toHaveBeenCalledWith(false)
  })

  it("rejected signIn (401/403/network) shows readable error, writes nothing", async () => {
    const db = fakeDb()
    const notify = vi.fn()
    const navigate = vi.fn()
    const setSubmitting = vi.fn()
    const boom = Object.assign(new Error("The user does not have permission"), { status: 401 })

    const ok = await completeSignIn({
      t,
      signIn: async () => { throw boom },
      setSubmitting,
      db,
      notify,
      navigate
    })

    expect(ok).toBe(false)
    expect(db.users.put).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", title: "Sign in failed", content: "The user does not have permission" })
    )
    expect(navigate).not.toHaveBeenCalled()
    expect(setSubmitting).toHaveBeenCalledWith(false)
  })

  it("malformed 2xx envelope ({errors}) fails with the mapped message, no writes", async () => {
    const db = fakeDb()
    const notify = vi.fn()

    const ok = await completeSignIn({
      t,
      signIn: async () => ({ errors: "Username or password not match" }),
      db,
      notify,
      navigate: vi.fn()
    })

    expect(ok).toBe(false)
    expect(db.users.put).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", content: "Username or password not match" })
    )
  })

  it("missing token fails when requireToken (default) — incomplete success envelope", async () => {
    const db = fakeDb()
    const notify = vi.fn()

    const ok = await completeSignIn({
      t,
      signIn: async () => ({ id: "u1", user: { username: "a@x.io" } }),
      db,
      notify,
      navigate: vi.fn()
    })

    expect(ok).toBe(false)
    expect(db.users.put).not.toHaveBeenCalled()
  })

  it("requireToken:false allows token-less results (local auth)", async () => {
    const db = fakeDb()
    const notify = vi.fn()

    const ok = await completeSignIn({
      t,
      signIn: async () => ({ id: "local", user: { username: "local", role: "admin" } }),
      requireToken: false,
      db,
      notify,
      navigate: vi.fn()
    })

    expect(ok).toBe(true)
    expect(db.users.put).toHaveBeenCalled()
  })

  it("storage failure reports an error and never calls afterPersist/navigate", async () => {
    const db = fakeDb()
    db.transaction = vi.fn(async () => { throw new Error("IndexedDB quota exceeded") })
    const notify = vi.fn()
    const afterPersist = vi.fn()
    const navigate = vi.fn()
    const setSubmitting = vi.fn()

    const ok = await completeSignIn({
      t,
      signIn: async () => goodResult,
      setSubmitting,
      db,
      notify,
      afterPersist,
      navigate
    })

    expect(ok).toBe(false)
    expect(afterPersist).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", content: "IndexedDB quota exceeded" })
    )
    expect(setSubmitting).toHaveBeenCalledWith(false)
  })

  it("fails once, then succeeds after the user edits input and retries", async () => {
    const db = fakeDb()
    const notify = vi.fn()
    const navigate = vi.fn()
    const setSubmitting = vi.fn()
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(new Error("Request Timeout: /api/users/login"))
      .mockResolvedValueOnce(goodResult)

    const first = await completeSignIn({ t, signIn: attempt, setSubmitting, db, notify, navigate })
    const second = await completeSignIn({ t, signIn: attempt, setSubmitting, db, notify, navigate })

    expect(first).toBe(false)
    expect(second).toBe(true)
    expect(attempt).toHaveBeenCalledTimes(2)
    expect(setSubmitting).toHaveBeenCalledTimes(2)
    expect(navigate).toHaveBeenCalledTimes(1)
  })

  it("custom navigate/successTitle/failureTitle are honored (strapi sign-up)", async () => {
    const db = fakeDb()
    const notify = vi.fn()
    const navigate = vi.fn()

    await completeSignIn({
      t,
      signIn: async () => goodResult,
      db,
      notify,
      navigate,
      successTitle: "Sign up successful",
      failureTitle: "Sign up failed"
    })

    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ title: "Sign up successful" }))
  })
})
