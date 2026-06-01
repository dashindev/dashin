import { Dispatch, SetStateAction } from "react"
import { DashinFileType, notice, OnDropProps } from "@dashin-dev/dashin"
import uploadFileSer from "../services/uploadFileSer"
import { EditComponentProps } from "@dashin-dev/dashin"

interface Props extends OnDropProps {
  editProps?: EditComponentProps<any>
  setImageUrl?: Dispatch<SetStateAction<string>>
  uploadPrefix?: string
  setFiles?: Dispatch<SetStateAction<DashinFileType[]>>
  files?: DashinFileType[]
  existedFile?: DashinFileType
}

export default async function uploadMediaCtrl({
  editProps,
  droppedFiles,
  existedFile,
  files = [],
  setFiles,
  prefix,
  setImageUrl,
  uploadPrefix
}: Props) {
  const formMedia = new FormData()
  // handling multiple files
  droppedFiles.map((file: string | Blob) => formMedia.append("files", file))

  // strapi upload
  const res = await uploadFileSer(
    formMedia,
    { prefix: uploadPrefix },
    existedFile
  )

  if (res[0]) {
    if (res.length === 1) {
      setImageUrl && setImageUrl(prefix + res[0].url)
      files = [...files, ...res]
    } else {
      const respFiles: DashinFileType[] = []
      res.map(file =>
        respFiles.push({
          url: file.url,
          file_name: file.name,
          display_name: file.name,
          id: file.id
        })
      )
      files = [...files, ...respFiles]
    }
    setFiles && setFiles(files)
    // await notice({ title: "Uploaded successfully" })

    // Insert to MUI Table Field
    if (!editProps) return
    const field = editProps.columnDef.field

    editProps.onChange(files || [])
    editProps.onRowDataChange({
      ...editProps.rowData,
      [field]: files || []
    })
  } else {
    const errors = (res as unknown) as {
      error: string
      message: string
      statusCode: number
    }
    await notice({
      title: "Uploaded failed",
      content: errors.error || errors.message
    })
  }
}
