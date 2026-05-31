import { describe, it, expect } from "vitest"
import { mapPbAuth } from "../signInService"

describe("mapPbAuth", () => {
  it("maps a valid PocketBase auth response to {id, token, user}", () => {
    const res = {
      token: "tok",
      record: { id: "abc", username: "demo", role: "admin" }
    }
    expect(mapPbAuth(res)).toEqual({
      id: "abc",
      token: "tok",
      user: { username: "demo", role: "admin" }
    })
  })

  it("falls back to email then provided username, and defaults role", () => {
    expect(
      mapPbAuth({ token: "t", record: { id: "1", email: "e@x.io" } }).user
    ).toEqual({ username: "e@x.io", role: "user" })
    expect(
      mapPbAuth({ token: "t", record: { id: "1" } }, "fallback").user
    ).toEqual({ username: "fallback", role: "user" })
  })

  it("returns errors when token/record missing", () => {
    expect(mapPbAuth({ code: 400 }).errors).toBeTruthy()
    expect(mapPbAuth(null).errors).toBeTruthy()
  })
})
