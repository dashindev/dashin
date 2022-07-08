import React from "react"
import ConfirmDialog from "@/components/Dialog/ConfirmDialog"
import { fsDownload } from "@/utils/scripts/fs"
import UploadConfirmDialog from "@/components/Dialog/UploadCustomDialog"
import { BA_DB } from "@/utils"
import { notice } from "@/main"

let dxIEModule

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
  tableRef?: React.RefObject<any>
}

export default function MigrationDialogs({
  selData,
  modalState,
  uploadModal,
  tableRef
}: Interface) {
  return (
    <>
      {/* ConfirmDialog */}
      <ConfirmDialog
        openModal={modalState.open}
        title={modalState.title}
        msg={modalState.msg}
        doFunc={async () => {
          switch (selData.mode) {
            case "Export DB":
              if (typeof window === "undefined") return
              // use dynamic-import to fix error `ReferenceError: self is not defined`
              dxIEModule = await import("dexie-export-import")
              const blob = await dxIEModule.exportDB(BA_DB, {
                prettyJson: true,
                filter: table => table !== "notifications"
              })

              const dateObj = new Date()
              const month = dateObj.getUTCMonth() + 1 //months from 1-12
              const day = dateObj.getDate()
              const year = dateObj.getUTCFullYear()

              const newDate = year + "-" + month + "-" + day
              fsDownload(blob, `${BA_DB.name}-${newDate}.json`)
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
          let errMsg: string | undefined
          try {
            let file = e.target?.files[0]
            if (!file) throw new Error(`Only files can be dropped here`)
            file = file as Blob

            await BA_DB.delete()

            dxIEModule = await import("dexie-export-import")
            await dxIEModule.importDB(file)
          } catch (error) {
            errMsg = "" + error
            console.error(errMsg)
          }
          // reopen
          await BA_DB.open()
          if (errMsg) {
            return notice({
              title: "Import database failed",
              severity: "error",
              content: errMsg
            })
          }
          // reload
          tableRef?.current && tableRef.current.onQueryChange()
        }}
      />
    </>
  )
}
