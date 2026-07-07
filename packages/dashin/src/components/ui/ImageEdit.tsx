import React, { useEffect, useState } from "react"

// A token-driven image-upload editComponent: shows the current image (round),
// lets the user pick a new one (uploaded via the injected `upload`), remove it,
// or click to enlarge. Adapter-agnostic — the upload + URL resolution are
// injected, so it works with any backend (e.g. Payload media + photoThumb).
export interface ImageEditProps {
  value?: any
  onChange: (value: any) => void
  /** Upload a picked file; resolve the raw result (e.g. a created media doc). */
  upload: (file: File) => Promise<any>
  /** Map the upload result → the value to store (default: the result itself,
   *  e.g. `doc => doc.id` for a relationship). */
  toValue?: (result: any) => any
  /** Existing value → preview URL (shown on open). */
  previewUrl?: (value: any) => string | null | undefined
  /** Upload result → preview URL (shown right after a fresh upload). */
  resultUrl?: (result: any) => string | null | undefined
  accept?: string
  className?: string
  chooseLabel?: string
  removeLabel?: string
}

const ImageEdit: React.FC<ImageEditProps> = ({
  value,
  onChange,
  upload,
  toValue,
  previewUrl,
  resultUrl,
  accept = "image/*",
  className = "",
  chooseLabel = "Choose image",
  removeLabel = "Remove"
}) => {
  const [preview, setPreview] = useState<string | null>(previewUrl ? previewUrl(value) ?? null : null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const onFile = async (file: File) => {
    setBusy(true)
    setErr(null)
    try {
      const result = await upload(file)
      onChange(toValue ? toValue(result) : result)
      setPreview((resultUrl ? resultUrl(result) : null) ?? null)
    } catch (e: any) {
      setErr((e && e.message) || "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => preview && setOpen(true)}
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-content-bg ring-1 ring-bn-border"
        aria-label="preview"
      >
        {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="text-icon-muted">—</span>}
      </button>
      <div className="flex flex-col items-start gap-1">
        <label className="cursor-pointer rounded-bn border border-bn-border bg-content-box px-3 py-1.5 text-sm text-foreground hover:bg-content-bg">
          {busy ? "Uploading…" : chooseLabel}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={busy}
            onChange={e => {
              const f = e.target.files && e.target.files[0]
              if (f) onFile(f)
              e.target.value = ""
            }}
          />
        </label>
        {preview && (
          <button
            type="button"
            className="text-xs text-danger"
            onClick={() => {
              onChange(null)
              setPreview(null)
            }}
          >
            {removeLabel}
          </button>
        )}
        {err && <span className="text-xs text-danger">{err}</span>}
      </div>

      {open && preview && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/70 p-6"
          onClick={() => setOpen(false)}
        >
          <img src={preview} alt="" className="max-h-[80vh] max-w-full rounded-lg object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default ImageEdit
