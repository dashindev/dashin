import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import DropZone, { DropEvent, FileRejection } from "react-dropzone"
import FilePreview from "../FilePreview"
import BunadminFileProps, { BunadminFileType } from "../"
import CardBottomArea from "./CardBottomArea"
import { Translation } from "react-i18next"
import { ENV } from "@/utils"

export const upload_image = "/p/upload.svg"
export const default_file = "/p/default_file.svg"

export interface OnDropProps {
  droppedFiles: any[]
  existedFile?: BunadminFileType
  rejectedFiles?: FileRejection[]
  event?: DropEvent
  prefix?: string
  setImageUrl?: Dispatch<SetStateAction<string>>
}

export default function BunadminFile(props: BunadminFileProps) {
  const {
    fileKey,
    className,
    ariaAttributes,
    htmlAttributes,

    uploadText,
    replaceText,

    file,
    width,
    prefix,
    onDrop,
    onDel,
    cardStyle,
    mediaStyle = {},
    viewMode,
    multipleUpload,
    hideUploadTip
  } = props

  let id: string | undefined,
    display_name: string | undefined,
    url: string | undefined
  if (file) {
    id = file.id
    display_name = file.display_name
    url = file.url
  }

  const rootWidth = width || 150
  const previewUrl = ENV.FILE_PREVIEW_URL
  const [uploading, setUploading] = React.useState(false),
    [imageUrl, setImageUrl] = React.useState(
      url
        ? typeof previewUrl === "string"
          ? previewUrl + url
          : prefix
          ? prefix + url
          : url
        : upload_image
    ),
    [preview, setPreview] = useState(false)

  const handleOnDrop = async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[],
    event: DropEvent,
    existedFile?: BunadminFileType
  ) => {
    setUploading(true)
    if (onDrop) {
      await onDrop({
        droppedFiles: acceptedFiles,
        existedFile,
        rejectedFiles,
        event,
        prefix,
        setImageUrl
      })
    }
    setUploading(false)
  }

  const handleDelMedia = async () => {
    setUploading(true)
    if (onDel) {
      await onDel({ file })
      setImageUrl(upload_image)
    }
    setUploading(false)
  }

  const BottomComp = () => (
    <CardBottomArea
      id={id}
      uploading={uploading}
      setPreview={setPreview}
      handleDelMedia={handleDelMedia}
    />
  )

  useEffect(() => {
    multipleUpload &&
      console.log(multipleUpload, "Multiple Upload not supported yet")
  }, [display_name, multipleUpload])

  const UploadText = () => (
    <Translation ns="table">{t => t("Choose or drag")}</Translation>
  )

  const ReplaceText = () => (
    <Translation ns="table">{t => t("Choose or drag to replace")}</Translation>
  )

  return (
    <div
      {...ariaAttributes}
      {...htmlAttributes}
      key={fileKey}
      className={className}
      style={{ width: rootWidth }}
    >
      <FilePreview
        preview={preview}
        setPreview={setPreview}
        file={file}
        prefix={prefix}
      />

      <div
        className="relative border border-bn-border rounded"
        style={{
          margin: id ? "20px 0" : "20px 5px 20px 0",
          ...(viewMode ? mediaStyle : {}),
          ...cardStyle
        }}
        onClick={() => id && viewMode && setPreview(true)}
      >
        <DropZone
          onDrop={(acceptedFiles, rejectedFiles, event) =>
            handleOnDrop(acceptedFiles, rejectedFiles, event, file)
          }
        >
          {({
            getRootProps,
            getInputProps
          }: {
            getRootProps: any
            getInputProps: any
          }) => {
            if (!uploading) {
              return (
                <div className={viewMode && !id ? "pointer-events-none opacity-50" : "cursor-pointer"}>
                  {!viewMode && (
                    <div
                      {...getRootProps()}
                      className="absolute inset-0 z-[1] flex items-center justify-center"
                    >
                      {width && width >= 100 && (
                        <div className="text-white text-xs opacity-60 max-w-[100px] bg-black/50 rounded px-2 py-1 text-center" style={{ textShadow: "1px 1px 10px #fff" }}>
                          {!hideUploadTip &&
                            (!id
                              ? uploadText || <UploadText />
                              : replaceText || <ReplaceText />)}
                        </div>
                      )}
                      <input {...getInputProps()} />
                    </div>
                  )}
                  <img
                    className={imageUrl === upload_image ? "p-2.5" : ""}
                    style={{ ...mediaStyle, width, height: width || undefined }}
                    src={handleImage(imageUrl)}
                    alt=""
                  />
                  {!id && viewMode && <BottomComp />}
                </div>
              )
            } else {
              return (
                <div
                  className="absolute inset-0 z-[1] flex items-center justify-center"
                  style={{
                    ...mediaStyle,
                    width,
                    height: width || undefined,
                    position: "relative"
                  }}
                >
                  {/* Spinner */}
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )
            }
          }}
        </DropZone>

        {!viewMode && (id || uploading) && <BottomComp />}
      </div>
    </div>
  )
}

export function handleImage(url: string): string {
  if (!isImage(url)) return default_file

  return url
}

export function isImage(url: string): boolean {
  return /.*(apng|bmp|gif|ico|cur|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)/gim.test(
    url
  )
}
