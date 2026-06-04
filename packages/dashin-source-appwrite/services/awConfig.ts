import { ENV, storedToken } from "@dashin-dev/dashin"

export const PROJECT = ENV.APPWRITE_PROJECT
export const DATABASE =
  ENV.APPWRITE_DATABASE || "default"

/** Common Appwrite headers (project + JWT) for a request. */
export async function awHeaders(): Promise<Record<string, string>> {
  const token = await storedToken()
  return {
    ...(PROJECT ? { "X-Appwrite-Project": PROJECT } : {}),
    ...(token ? { "X-Appwrite-JWT": token } : {})
  }
}

/** Documents collection endpoint base. */
export function docPath(collectionId: string, documentId?: string): string {
  const base = `/v1/databases/${DATABASE}/collections/${collectionId}/documents`
  return documentId ? `${base}/${documentId}` : base
}
