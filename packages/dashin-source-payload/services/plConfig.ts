import { ENV, storedToken } from "@dashin-dev/dashin"

/** Payload collection endpoint (always includes the `/api` segment). */
export function apiPath(collection: string, id?: string): string {
  const base = `/api/${collection}`
  return id !== undefined ? `${base}/${id}` : base
}

/**
 * Resolve the API base/origin for requests. Since apiPath() already adds the
 * Payload `/api` segment, strip a trailing `/api` from the configured base so a
 * `/api/api/...` double-prefix can't happen — works whether VITE_MAIN_URL is
 * set to the origin or to origin + `/api`.
 */
export function apiBase(prefix?: string): string {
  const base = prefix || ENV.MAIN_URL || ENV.AUTH_URL || ""
  return base.replace(/\/api\/?$/, "")
}

/** Payload auth header (JWT Bearer) from the stored token. */
export async function plHeaders(
  extra: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = await storedToken()
  return {
    ...(token ? { Authorization: `Bearer ${String(token).replace(/^Bearer /, "")}` } : {}),
    ...extra
  }
}
