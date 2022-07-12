import React, { useRef, useState } from "react"

import { MTableToolbar } from "material-table"
import { useTheme } from "@material-ui/core/styles"
import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"

import Table, { TableHead } from "@/components/Table"
import tableIcons from "@/components/Table/models/tableIcons"
import { Columns } from "./columns"
import { Schema } from "./schema"
import { Box, Button } from "@material-ui/core"
import EvaIcon from "react-eva-icons"
import { Type } from "./types"
import MigrationDialogs from "./components/Dialog"
import { useTranslation } from "react-i18next"
import { BA_DB, BunadminDatabase } from "@/utils/database"

export default function MigrationContainer({ db }: { db?: BunadminDatabase }) {
  const tableRef = useRef(null)
  const { t } = useTranslation("table")
  const theme = useTheme()
  const color: string = theme.palette.primary.main
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
          tableRef={tableRef}
          title={t(Schema.title)}
          columns={Columns({ t })}
          data={async () => {
            let totalCount = 0
            let tables: Type[] = []
            if (!db) {
              db = BA_DB
            }

            await db.open() // reopen when reloading

            tables = await Promise.all(
              db.tables.map(async table => {
                const count = await table.count()
                totalCount = totalCount + count
                return {
                  name: table.name,
                  count,
                  primKey: table.schema.primKey.src
                }
              })
            )

            return {
              data: tables,
              totalCount,
              page: 0
            }
          }}
          // style
          style={DefaultProps.style}
          // icons
          icons={tableIcons({ theme })}
          // options
          options={{
            ...DefaultProps.options,
            selection: false,
            search: false
          }}
          components={{
            Toolbar: props => (
              <div>
                <MTableToolbar {...props} />
                <Box p="16px 24px" display="flex" alignItems="center">
                  <Box fontSize={18}>
                    <>
                      {BA_DB.name} - {BA_DB.verno}
                    </>
                  </Box>
                  <Box display="flex" pl={5}>
                    <Button
                      style={{ marginRight: 16 }}
                      color="primary"
                      startIcon={
                        <EvaIcon
                          name="download-outline"
                          size="medium"
                          fill={color}
                        />
                      }
                      onClick={() => {
                        const msg = t(
                          "Do you want to backup the current database locally?"
                        )
                        setModalState({
                          title: t("Export"),
                          open: modalState.open + 1,
                          msg
                        })
                        setSelData({
                          name: "Database",
                          mode: "Export DB"
                        })
                      }}
                    >
                      {t("Download")}
                    </Button>
                    <Button
                      color="primary"
                      startIcon={
                        <EvaIcon
                          name="upload-outline"
                          size="medium"
                          fill={color}
                        />
                      }
                      onClick={() => {
                        const msg = t(
                          "Are you sure you want to import and overwrite the database?"
                        )
                        setUploadModal({
                          title: t("Import"),
                          open: uploadModal.open + 1,
                          msg
                        })
                        setSelData({
                          name: "ALL",
                          mode: "Import DB"
                        })
                      }}
                    >
                      {t("Upload")}
                    </Button>
                  </Box>
                </Box>
              </div>
            )
          }}
        />
      </>
      <MigrationDialogs
        selData={selData}
        modalState={modalState}
        uploadModal={uploadModal}
        tableRef={tableRef}
        db={db}
      />
    </>
  )
}
