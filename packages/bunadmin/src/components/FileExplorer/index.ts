import { AriaAttributes, HTMLAttributes } from "react"

import { OnDropProps as IOnDropProps } from "./DashinFile"
export type OnDropProps = IOnDropProps

export { default as DashinFile } from "./DashinFile"

export { default as FilePreview } from "./FilePreview"
export { default as FileDrawer, useFilesStyles } from "./FileDrawer"

export { default as Uploader } from "./Uploader"

export type DashinFileType = {
  id?: string
  file_name?: string
  url?: string
  display_name?: string
  created_at?: string
}

export default interface DashinFileProps {
  fileKey?: string | number
  className?: string
  ariaAttributes?: AriaAttributes
  htmlAttributes?: HTMLAttributes<any>

  t?: any
  uploadText?: string
  replaceText?: string

  file?: DashinFileType
  title?: string
  width?: number
  prefix?: string

  onDrop?: UploaderOnDrop
  onDel?: UploaderOnDel

  cardStyle?: object
  mediaStyle?: object

  viewMode?: boolean
  multipleUpload?: boolean
  hideUploadTip?: boolean
}

export type UploaderOnDrop = ({
  droppedFiles,
  prefix,
  setImageUrl,
  rejectedFiles,
  event
}: OnDropProps) => Promise<void | null>

export type UploaderOnDel = ({ file }: { file: any }) => Promise<void | null>
