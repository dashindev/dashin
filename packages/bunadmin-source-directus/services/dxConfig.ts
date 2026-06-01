import { storedToken } from "@xbuilder/bunadmin"

/** Directus items endpoint. */
export function itemsPath(collection: string, id?: string): string {
  const base = `/items/${collection}`
  return id !== undefined ? `${base}/${id}` : base
}

/** Bearer auth header from the stored token. */
export async function dxHeaders(
  extra: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = await storedToken()
  return {
    ...(token ? { Authorization: `Bearer ${String(token).replace(/^Bearer /, "")}` } : {}),
    ...extra
  }
}
