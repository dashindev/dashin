import React, { useState } from "react"

import { MTableToolbar } from "material-table"
import { useTheme } from "@material-ui/core/styles"
import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"

import Table, { TableHead } from "@/components/Table"
import tableIcons from "@/components/Table/models/tableIcons"
import { Columns } from "./columns"
import { Schema } from "./schema"
import { Data } from "./data"
import EvaIcon from "react-eva-icons"
import IconButton from "@material-ui/core/IconButton"
import { Type } from "./types"
import MigrationDialogs from "./components/Dialog"
import { useTranslation } from "react-i18next"
import { BA_DB } from "@/utils/database"

export default function MigrationContainer() {
  const { t } = useTranslation("table")
  const theme = useTheme()
  const color: string = theme.bunadmin.iconColor
  const [selData, setSelData] = useState({
    name: "schema",
    mode: "Export"
  })
  const [modalState, setModalState] = useState({
    open: 0,
    title: "",
    msg: ""
  })
  const [uploadModal, setUploadModal] = useState({
    open: 0,
    title: "",
    msg: ""
  })

  return (
    <>
      <>
        <TableHead title={t(Schema.title)} />
        <Table
          title={t(Schema.title)}
          columns={Columns({ t })}
          data={Data({ t }) as any}
          // style
          style={DefaultProps.style}
          // icons
          icons={tableIcons({ theme })}
          // options
          options={{ ...DefaultProps.options, selection: false }}
          // actions
          actions={[
            {
              tooltip: "Export",
              icon: () => (
                <EvaIcon name="download-outline" size="large" fill={color} />
              ),
              onClick: async (_evt, data: Type[] | Type) => {
                if (!("name" in data)) return
                const db = BA_DB
                const collection = data.name
                // TODO DX export
                // db[collection]
                //   .exportJSON()
                //   .then((json: any) =>
                //     fsDownload(json, collection, "application/json")
                //   )
              }
            },
            {
              tooltip: "Import",
              icon: () => (
                <EvaIcon name="upload-outline" size="large" fill={color} />
              ),
              onClick: async (_evt, data: Type[] | Type) => {
                if (!("name" in data)) return
                const msg = `Do you want to restore ${data.name}?`
                setUploadModal({
                  title: "Import / Restore",
                  open: uploadModal.open + 1,
                  msg
                })
                setSelData({
                  name: data.name,
                  mode: "Export DB"
                })
              }
            }
          ]}
          components={{
            Toolbar: props => (
              <div>
                <MTableToolbar {...props} />
                <div style={{ padding: "0px 10px" }}>
                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={() => {
                      const msg = "Do you want to backup Local Database?"
                      setModalState({
                        title: "Clone / Backup",
                        open: modalState.open + 1,
                        msg
                      })
                      setSelData({
                        name: "Database",
                        mode: "Export DB"
                      })
                    }}
                    color="inherit"
                  >
                    <EvaIcon
                      name="save-outline"
                      size="large"
                      fill={theme.bunadmin.iconColor}
                    />
                  </IconButton>
                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={() => {
                      const msg = "Do you want to overwrite Local Database?"
                      setUploadModal({
                        title: "Restore Local Database",
                        open: uploadModal.open + 1,
                        msg
                      })
                      setSelData({
                        name: "ALL",
                        mode: "Import DB"
                      })
                    }}
                    color="inherit"
                  >
                    <EvaIcon
                      name="sync-outline"
                      size="large"
                      fill={theme.bunadmin.iconColor}
                    />
                  </IconButton>
                </div>
              </div>
            )
          }}
        />
      </>
      <MigrationDialogs
        selData={selData}
        modalState={modalState}
        uploadModal={uploadModal}
      />
    </>
  )
}
