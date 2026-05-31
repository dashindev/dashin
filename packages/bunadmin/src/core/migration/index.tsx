import React, { useRef, useState } from "react"

import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"

import Table, { TableHead } from "@/components/Table"
import tableIcons from "@/components/Table/models/tableIcons"
import { Columns } from "./columns"
import { Schema } from "./schema"
import EvaIcon from "../../components/EvaIcon"
import { Type } from "./types"
import MigrationDialogs from "./components/Dialog"
import { useTranslation } from "react-i18next"
import { BA_DB, BunadminDatabase } from "@/utils/database"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }
const primaryColor = "#3366ff"

export default function MigrationContainer({ db }: { db?: BunadminDatabase }) {
  const tableRef = useRef(null)
  const { t } = useTranslation("table")
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
        <div className="flex items-center px-6 py-4">
          <span className="text-lg">
            {BA_DB.name} - {BA_DB.verno}
          </span>
          <div className="flex pl-10">
            <button
              className="mr-4 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
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
              <EvaIcon
                name="download-outline"
                size="medium"
                fill={primaryColor}
              />
              {t("Download")}
            </button>
            <button
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
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
              <EvaIcon
                name="upload-outline"
                size="medium"
                fill={primaryColor}
              />
              {t("Upload")}
            </button>
          </div>
        </div>
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
