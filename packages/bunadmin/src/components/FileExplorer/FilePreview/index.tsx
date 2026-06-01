import React, { Dispatch, SetStateAction, useState } from "react"
import { ZoomIn, ZoomOut, Download, X } from "lucide-react"
import { Dialog } from "@headlessui/react"
import { DashinFileType } from "@/components"
import {
  default_file,
  handleImage,
  isImage
} from "@/components/FileExplorer/DashinFile"
import { ENV } from "@/utils"

interface Props {
  preview: boolean
  setPreview: Dispatch<SetStateAction<boolean>>
  fullScreen?: boolean
  file?: DashinFileType
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
                  <ZoomIn className="h-5 w-5" />
                ) : (
                  /* ZoomOut icon */
                  <ZoomOut className="h-5 w-5" />
                )}
              </button>
            )}

            <a href={url} target="_blank" rel="noopener noreferrer">
              <button aria-label="Download" className="p-1 rounded hover:bg-primary/10">
                {/* Download icon */}
                <Download className="h-5 w-5" />
              </button>
            </a>

            <button aria-label="Close" onClick={handleClose} className="p-1 rounded hover:bg-primary/10">
              {/* Close icon */}
              <X className="h-5 w-5" />
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
