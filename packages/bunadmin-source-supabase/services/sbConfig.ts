import { ENV, storedToken } from "@xbuilder/bunadmin"

// Supabase anon/service key (from VITE_* env, surfaced on ENV).
export const SUPABASE_KEY =
  (ENV as any).SUPABASE_KEY || (ENV as any).SUPABASE_ANON_KEY || ""

/** PostgREST endpoint for a table. */
export function tablePath(table: string): string {
  return `/rest/v1/${table}`
}

/** Common Supabase headers: apikey + Authorization Bearer (user JWT or anon). */
export async function sbHeaders(
  extra: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = (await storedToken()) || SUPABASE_KEY
  return {
    ...(SUPABASE_KEY ? { apikey: SUPABASE_KEY } : {}),
    ...(token ? { Authorization: `Bearer ${String(token).replace(/^Bearer /, "")}` } : {}),
    ...extra
  }
}
