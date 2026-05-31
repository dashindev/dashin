import React, { Dispatch, SetStateAction, useState } from "react"
import { Dialog } from "@headlessui/react"
import { BunadminFileType } from "@/components"
import {
  default_file,
  handleImage,
  isImage
} from "@/components/FileExplorer/BunadminFile"
import { ENV } from "@/utils"

interface Props {
  preview: boolean
  setPreview: Dispatch<SetStateAction<boolean>>
  fullScreen?: boolean
  file?: BunadminFileType
  prefix?: string
}

export default function FilePreview({
  preview,
  setPreview,
  fullScreen,
  file,
  prefix
}: Props) {
  const [state, setState] = useState({ fullScreen: fullScreen })

  if (!file) return null
  const { created_at, display_name, file_name } = file

  let { url = default_file } = file
  const previewUrl = ENV.FILE_PREVIEW_URL
  url =
    typeof previewUrl === "string"
      ? previewUrl + url
      : prefix
      ? prefix + url
      : url

  function handleFullWidthChange() {
    setState({ ...state, fullScreen: !state.fullScreen })
  }
  const handleClose = () => {
    setPreview(false)
  }

  return (
    <Dialog open={preview} onClose={handleClose} className="relative z-[1300]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className={`fixed inset-0 flex items-center justify-center ${state.fullScreen ? "" : "p-4"}`}>
        <Dialog.Panel className={`bg-content-box shadow-xl flex flex-col ${state.fullScreen ? "w-full h-full" : "max-w-3xl max-h-[90vh] rounded"}`}>
          {/* Image area */}
          <div
            className="flex-1 flex items-center justify-center overflow-auto cursor-pointer"
            onClick={handleClose}
          >
            <img
              style={{ width: "max-content" }}
              src={handleImage(url)}
              alt={display_name || file_name}
              title={display_name || file_name}
            />
          </div>
          {/* Actions */}
          <div className="flex items-center justify-center gap-2 p-2 border-t border-bn-border">
            <button onClick={handleClose} className="text-primary text-sm px-2 py-1 hover:bg-primary/10 rounded">
              {display_name || created_at}
            </button>

            {isImage(url) && (
              <button
                aria-label="Preview"
                onClick={handleFullWidthChange}
                className="p-1 rounded hover:bg-primary/10"
              >
                {!state.fullScreen ? (
                  /* ZoomIn icon */
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2V7z"/></svg>
                ) : (
                  /* ZoomOut icon */
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7V9z"/></svg>
                )}
              </button>
            )}

            <a href={url} target="_blank" rel="noopener noreferrer">
              <button aria-label="Download" className="p-1 rounded hover:bg-primary/10">
                {/* Download icon */}
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              </button>
            </a>

            <button aria-label="Close" onClick={handleClose} className="p-1 rounded hover:bg-primary/10">
              {/* Close icon */}
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
