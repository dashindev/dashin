import { storedToken } from "@xbuilder/bunadmin"

/** Payload collection endpoint. */
export function apiPath(collection: string, id?: string): string {
  const base = `/api/${collection}`
  return id !== undefined ? `${base}/${id}` : base
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
