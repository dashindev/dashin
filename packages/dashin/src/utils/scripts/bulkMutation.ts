export type MutationOutcome = "succeeded" | "failed" | "unknown"

export interface BulkItemOutcome {
  id: string | number
  outcome: MutationOutcome
  error?: unknown
}

/** Adapters can explicitly confirm failure; transport loss is conservative. */
export function mutationFailureOutcome(error: any): "failed" | "unknown" {
  if (error?.outcome === "failed" || error?.outcome === "unknown") return error.outcome
  // RequestError uses a synthetic 504 for a client timeout: no server
  // acknowledgement exists, so it must not become a confirmed failure.
  if ([408, 504].includes(Number(error?.status ?? error?.response?.status))) return "unknown"
  return Number(error?.status ?? error?.response?.status) >= 400 ? "failed" : "unknown"
}

/** Additive metadata: legacy resList entries and their ordering stay intact. */
export class BulkMutationError extends Error {
  readonly okCount: number
  readonly failCount: number
  readonly outcomes: BulkItemOutcome[]
  constructor(message: string, public readonly resList: any[], ids: (string | number)[]) {
    super(message)
    this.name = "BulkMutationError"
    this.outcomes = resList.map((result, index) => ({
      id: ids[index],
      outcome: result?.error ? result.outcome ?? "unknown" : "succeeded",
      ...(result?.error ? { error: result.cause ?? result.error } : {})
    }))
    this.okCount = this.outcomes.filter(item => item.outcome === "succeeded").length
    this.failCount = this.outcomes.length - this.okCount
  }
}
