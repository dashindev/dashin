import { describe, it, expect } from "vitest"
import { BulkMutationError, mutationFailureOutcome } from "../bulkMutation"

describe("bulk mutation metadata", () => {
  it("keeps legacy results and adds every ID, outcome, original cause and counts", () => {
    const cause = new Error("Connection lost")
    const resList = [{ rows: [] }, { error: "Connection lost", outcome: "unknown", cause }, { error: "Locked", outcome: "failed" }]
    const error = new BulkMutationError("Partial failure", resList, ["SKU-1", "SKU-2", "SKU-3"])
    expect(error.resList).toBe(resList)
    expect(error).toMatchObject({ okCount: 1, failCount: 2, outcomes: [
      { id: "SKU-1", outcome: "succeeded" },
      { id: "SKU-2", outcome: "unknown", error: cause },
      { id: "SKU-3", outcome: "failed", error: "Locked" }
    ] })
  })
  it("requires adapter confirmation for unknown transport failures", () => {
    expect(mutationFailureOutcome(new Error("Timeout"))).toBe("unknown")
    expect(mutationFailureOutcome({ status: 504, isDashinRequestError: true })).toBe("unknown")
    expect(mutationFailureOutcome({ status: 403 })).toBe("failed")
    expect(mutationFailureOutcome({ outcome: "failed" })).toBe("failed")
    expect(mutationFailureOutcome({ response: { status: 500 }, outcome: "unknown" })).toBe("unknown")
  })
})
