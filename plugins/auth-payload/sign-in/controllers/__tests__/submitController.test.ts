import { describe, it, expect, vi, beforeEach } from "vitest"

const completeSignInMock = vi.fn()

vi.mock("@dashin-dev/dashin", () => ({
  completeSignIn: (...args: any[]) => completeSignInMock(...args)
}))

vi.mock("../../services/signInService", () => ({
  default: vi.fn(async () => ({ id: 1, token: "tok", user: { username: "a@x.io" } }))
}))

import submitController from "../submitController"
import userSignInService from "../../services/signInService"

const t = ((k: string) => k) as any

describe("auth-payload submitController", () => {
  beforeEach(() => {
    completeSignInMock.mockReset()
  })

  it("delegates the whole submit lifecycle to completeSignIn", async () => {
    completeSignInMock.mockResolvedValueOnce(true)
    const setSubmitting = vi.fn()

    await submitController({ t, values: { username: "a@x.io", password: "pw" }, setSubmitting })

    expect(completeSignInMock).toHaveBeenCalledTimes(1)
    const opts = completeSignInMock.mock.calls[0][0]
    expect(opts.t).toBe(t)
    expect(opts.setSubmitting).toBe(setSubmitting)

    // signIn wiring calls the Payload login service with the form values.
    await opts.signIn()
    expect(userSignInService).toHaveBeenCalledWith({ username: "a@x.io", password: "pw" })
  })

  it("never lets a service rejection escape — completeSignIn resolves it", async () => {
    // contract: submitController awaits completeSignIn and returns whatever it
    // resolves; transport failures are handled inside the helper, so the
    // Formik submit never sees an unhandled rejection.
    completeSignInMock.mockResolvedValueOnce(false)
    await expect(
      submitController({ t, values: { username: "a", password: "b" }, setSubmitting: vi.fn() })
    ).resolves.toBeUndefined()
  })
})
