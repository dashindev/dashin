/**
 * Extract a human-readable message from whatever a Payload REST call rejects
 * with (or returns as `{ errors }`). Payload nests the useful field-level
 * message under `errors[0].data.errors[0].message`; the top-level `message` is a
 * generic "The following field is invalid: …". We prefer the nested one, then
 * the outer, then any `Error.message`, then a fallback.
 *
 * Locale-neutral by design — it returns Payload's own (English) copy. Map it to
 * friendly, localized strings in your app if you want (e.g. detect
 * "already registered" / "must be unique" and swap in your own text).
 */
export function errMessage(e: any, fallback = "Request failed"): string {
  const body = (e && (e.response?.data ?? e.data)) ?? e
  const outer = body?.errors?.[0]
  const msg =
    outer?.data?.errors?.[0]?.message ||
    outer?.message ||
    body?.message ||
    (typeof e?.message === "string" ? e.message : "")
  return String(msg || "").trim() || fallback
}
