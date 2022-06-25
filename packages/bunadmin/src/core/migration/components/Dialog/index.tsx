import React from "react"
import ConfirmDialog from "@/components/Dialog/ConfirmDialog"
import { fsUpload } from "@/utils/scripts/fs"
import UploadConfirmDialog from "@/components/Dialog/UploadCustomDialog"
import { notice } from "@/core"

interface Interface {
  selData: {
    name: string
    mode: string
  }
  modalState: {
    open: number
    title: string
    msg: string
  }
  uploadModal: {
    open: number
    title: string
    msg: string
  }
}

export default function MigrationDialogs({
  selData,
  modalState,
  uploadModal
}: Interface) {
  return (
    <>
      {/* ConfirmDialog */}
      <ConfirmDialog
        openModal={modalState.open}
        title={modalState.title}
        msg={modalState.msg}
        doFunc={async () => {
          // const db = BA_DB
          switch (selData.mode) {
            case "Export DB":
              // TODO Export dx DB
              // db.exportJSON().then((json: any) =>
              //   fsDownload(json, "bunadmin.json", "application/json")
              // )
              break
            case "Import DB":
              // db.dump().then((json: any) => console.dir(json))
              break
            default:
              console.error("Missing method")
          }
        }}
      />
      {/* UploadConfirmDialog */}
      <UploadConfirmDialog
        title={uploadModal.title}
        msg={uploadModal.msg}
        accept="application/json"
        openModal={uploadModal.open}
        onChange={async e => {
          try {
            const json = await fsUpload(e)
            if (!json) return
            // const db = BA_DB
            // TODO DX dump
            // dump collection
            // if (selData.name !== "ALL") {
            //   db[selData.name].importJSON(json).then(() => {
            //     // show notice
            //     notice({ title: `Import successful` })
            //   })
            // } else {
            //   // dump database
            //   db.importJSON(json).then(() => {
            //     // show notice
            //     notice({ title: `Import successful` })
            //   })
            // }
          } catch (e) {
            const ea = e as any
            // show notice
            await notice({
              title: `Import failed`,
              severity: "error",
              content: ea.toString()
            })
          }
        }}
      />
    </>
  )
}
