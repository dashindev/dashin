import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  Card,
  CardActionArea,
  CardMedia,
  CircularProgress,
  Theme
} from "@mui/material"
import DropZone, { DropEvent, FileRejection } from "react-dropzone"
import FilePreview from "../FilePreview"
import styles from "./styles"
import BunadminFileProps, { BunadminFileType } from "../"
import CardBottomArea from "./CardBottomArea"
import { Translation } from "react-i18next"
import { ENV } from "@/utils"
import { makeStyles } from "@mui/styles"

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

  const classes = makeStyles((theme: Theme) => {
    return styles({ theme, id, width })
  })()
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
      classes={classes}
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
      className={`${className} ${classes.root}`}
    >
      <FilePreview
        preview={preview}
        setPreview={setPreview}
        file={file}
        prefix={prefix}
      />

      <Card
        className={classes.Card}
        style={{
          ...(viewMode && mediaStyle),
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
                <CardActionArea disabled={viewMode && !id}>
                  {!viewMode && (
                    <div {...getRootProps()} className={classes.DropZone}>
                      {width && width >= 100 && (
                        <div className={classes.UploadText}>
                          {!hideUploadTip &&
                            (!id
                              ? uploadText || <UploadText />
                              : replaceText || <ReplaceText />)}
                        </div>
                      )}
                      <input {...getInputProps()} />
                    </div>
                  )}
                  <CardMedia
                    className={
                      imageUrl === upload_image
                        ? classes.DefaultUpload
                        : undefined
                    }
                    style={{ ...mediaStyle, width, height: width || undefined }}
                    component="img"
                    image={handleImage(imageUrl)}
                  />
                  {!id && viewMode && <BottomComp />}
                </CardActionArea>
              )
            } else {
              return (
                <div
                  className={classes.DropZone}
                  style={{
                    ...mediaStyle,
                    width,
                    height: width || undefined,
                    position: "relative"
                  }}
                >
                  <CircularProgress />
                </div>
              )
            }
          }}
        </DropZone>

        {!viewMode && (id || uploading) && <BottomComp />}
      </Card>
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
