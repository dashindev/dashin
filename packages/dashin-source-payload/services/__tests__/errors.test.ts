import { describe, it, expect } from "vitest"
import { errMessage } from "../errors"

describe("errMessage", () => {
  it("prefers Payload's nested field-level message", () => {
    const e = {
      response: {
        data: {
          errors: [
            {
              message: "The following field is invalid: email",
              data: { errors: [{ message: "A user with the given email is already registered.", path: "email" }] }
            }
          ]
        }
      }
    }
    expect(errMessage(e)).toBe("A user with the given email is already registered.")
  })

  it("falls back to the outer message when there is no nested one", () => {
    expect(errMessage({ data: { errors: [{ message: "Value must be unique" }] } })).toBe("Value must be unique")
  })

  it("uses a plain Error's message", () => {
    expect(errMessage(new Error("boom"))).toBe("boom")
  })

  it("returns the fallback when nothing usable is present", () => {
    expect(errMessage({}, "Oops")).toBe("Oops")
    expect(errMessage(null)).toBe("Request failed")
  })
})
