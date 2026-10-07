import { describe, it, expect } from "vitest"
import { mapPayloadAuth } from "../signInService"

describe("mapPayloadAuth", () => {
  it("maps a valid Payload login response to {id, token, user}", () => {
    const res = {
      token: "tok",
      user: { id: 1, email: "admin@x.io", role: "admin" }
    }
    expect(mapPayloadAuth(res)).toEqual({
      id: 1,
      token: "tok",
      user: { username: "admin@x.io", role: "admin" }
    })
  })

  it("falls back email -> phone -> provided value, and defaults role to a non-privileged value", () => {
    // Fail closed: a missing role field must not silently grant admin menus.
    expect(
      mapPayloadAuth({ token: "t", user: { id: 1, phone: "13800001234" } }).user
    ).toEqual({ username: "13800001234", role: "user" })
    expect(
      mapPayloadAuth({ token: "t", user: { id: 1 } }, "fallback@x.io").user
    ).toEqual({ username: "fallback@x.io", role: "user" })
  })

  it("returns errors when token/user missing", () => {
    expect(mapPayloadAuth({ message: "Unauthorized" }).errors).toBeTruthy()
    expect(mapPayloadAuth(null).errors).toBeTruthy()
  })
})
