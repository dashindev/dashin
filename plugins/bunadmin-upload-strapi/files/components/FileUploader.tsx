import React, { useState, useEffect, RefObject } from "react"
import { TFunction } from "i18next"
import {
  ENV,
  BunadminFileType,
  Uploader,
  OnDropProps
} from "@xbuilder/bunadmin"
import { EditComponentProps } from "material-table"
import { DropResult } from "react-beautiful-dnd"
import { IFile } from "../.."
import uploadMediaCtrl from "../controllers/uploadMediaCtrl"

export default function FileUploader({
  t,
  viewMode = true,
  prefix,
  data,
  buttonTitlePreview,
  buttonTitleUpdate,
  editProps,
  noDrawer,
  maximum
}: {
  t: TFunction
  tableRef?: RefObject<any>
  viewMode?: boolean
  prefix?: string
  data?: IFile[] | IFile
  buttonTitlePreview?: string
  buttonTitleUpdate?: string
  editProps?: EditComponentProps<any>
  noDrawer?: boolean
  maximum?: number
}) {
  const [files, setFiles] = useState<BunadminFileType[]>([])
  if (!prefix && !ENV.ON_MOCK) prefix = ENV.UPLOAD_URL

  useEffect(() => {
    const tmp: BunadminFileType[] = []
    if (Array.isArray(data)) {
      data.map(item => {
        tmp.push({
          id: item.id,
          file_name: item.name,
          url: item.url,
          display_name: item.name
        })
      })
    } else {
      data &&
        tmp.push({
          id: data.id,
          file_name: data.name,
          url: data.url,
          display_name: data.name
        })
    }

    setFiles(tmp)
  }, [data])

  async function onDrop({
    droppedFiles,
    prefix,
    setImageUrl,
    existedFile
  }: OnDropProps) {
    await uploadMediaCtrl({
      editProps: editProps,
      droppedFiles,
      existedFile,
      prefix,
      setImageUrl,
      files,
      setFiles
    })
  }

  async function onDel({ file }: { file: BunadminFileType }) {
    const tmp: BunadminFileType[] = []
    files.map(item => {
      if (item.id !== file.id) tmp.push(item)
    })
    setFiles(tmp)
    // Insert to MUI Table Field
    if (!editProps) return
    const field = editProps.columnDef.field

    editProps.onChange(tmp || [])
    editProps.onRowDataChange({
      ...editProps.rowData,
      [field]: tmp || []
    })
  }

  function onDragSort(result: DropResult) {
    // TODO add position for Strapi Media or use alternativeText: replace 'bunadmin_65536' N soring
    console.log(result)
  }

  return (
    <Uploader
      t={t}
      viewMode={viewMode}
      files={files}
      prefix={prefix}
      buttonTitlePreview={buttonTitlePreview}
      buttonTitleUpdate={buttonTitleUpdate || "Upload Files"}
      onDrop={onDrop}
      onDel={onDel}
      onDragSort={onDragSort}
      noDrawer={noDrawer}
      width={80}
      maximum={maximum}
    />
  )
}
