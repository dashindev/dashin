import { describe, it, expect } from "vitest"
import { mapAtomoAuth } from "../sign-in/services/signInService"

describe("Atomo auth mapping", () => {
  it("maps successful Atomo login response", () => {
    const res = {
      token: "jwt-token-123",
      user: {
        id: "usr_1",
        email: "admin@atomo.test",
        role: "admin",
      },
    }
    const mapped = mapAtomoAuth(res)
    expect(mapped.token).toBe("jwt-token-123")
    expect(mapped.id).toBe("usr_1")
    expect(mapped.user.username).toBe("admin@atomo.test")
    expect(mapped.user.role).toBe("admin")
  })

  it("handles fallback email when user object lacks email", () => {
    const res = {
      token: "jwt-token-456",
      user: {
        id: "usr_2",
      },
    }
    const mapped = mapAtomoAuth(res, "fallback@atomo.test")
    expect(mapped.token).toBe("jwt-token-456")
    expect(mapped.user.username).toBe("fallback@atomo.test")
  })

  it("returns errors when response is invalid or missing token", () => {
    expect(mapAtomoAuth(null)).toHaveProperty("errors")
    expect(mapAtomoAuth({ error: "Invalid password" })).toHaveProperty("errors")
  })
})
