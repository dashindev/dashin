import { apiBase, plHeaders } from "./plConfig"

/**
 * Absolute URL for a Payload-relative media path (e.g. "/api/media/file/x.webp"),
 * resolved against the configured API origin. Absolute URLs pass through
 * unchanged; empty input returns null.
 */
export function mediaUrl(p?: string | null): string | null {
  if (!p) return null
  if (/^https?:\/\//.test(p)) return p
  return `${apiBase()}${p.startsWith("/") ? "" : "/"}${p}`
}

/**
 * Smallest sensible URL for a Payload upload/media object: the `thumbnail`
 * image-size, then `card`, then the original — so lists and table cells load a
 * tiny variant instead of a multi-MB original. Returns null when `photo` isn't a
 * populated media object (e.g. an unexpanded id).
 */
export function photoThumb(photo: any): string | null {
  if (!photo || typeof photo !== "object") return null
  const s = photo.sizes || {}
  return mediaUrl(s.thumbnail?.url || s.card?.url || photo.url)
}

/**
 * Larger URL for a preview/lightbox: the `card` image-size, then the original,
 * then `thumbnail`.
 */
export function photoLarge(photo: any): string | null {
  if (!photo || typeof photo !== "object") return null
  const s = photo.sizes || {}
  return mediaUrl(s.card?.url || photo.url || s.thumbnail?.url)
}

/**
 * Upload a file to a Payload upload-enabled collection (default `media`) and
 * return the created doc ({ id, url, sizes, … }). Uses fetch + FormData because
 * the JSON `request` helper can't send multipart; auth comes from `plHeaders`
 * (the browser sets the multipart boundary itself). Throws on a non-2xx status.
 */
export async function uploadMedia(
  file: File,
  opts: { collection?: string; alt?: string } = {}
): Promise<any> {
  const collection = opts.collection || "media"
  const fd = new FormData()
  fd.append("file", file)
  fd.append("_payload", JSON.stringify({ alt: opts.alt != null ? opts.alt : file.name || "" }))
  const res = await fetch(`${apiBase()}/api/${collection}`, {
    method: "POST",
    headers: await plHeaders(),
    body: fd
  })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
  const json = await res.json()
  return json?.doc
}
