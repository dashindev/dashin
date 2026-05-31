import React from "react"

import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"

import Table, { TableHead } from "@/components/Table"
import tableIcons from "@/components/Table/models/tableIcons"
import { Columns } from "./columns"
import { Schema } from "./schema"
import { Type } from "./types"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import { selectSchema } from "@/slices/schemaSlice"
import { JSON_VIEW_BG } from "@/utils/themes/defaultTheme"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function SchemaManagerContainer() {
  const { t } = useTranslation("table")
  let data = useSelector(selectSchema)
  data = data.map((item: Type) => ({ ...item }))

  return (
    <>
      <>
        <TableHead title={t(Schema.title)} />
        <Table
          title={t(Schema.title)}
          columns={Columns({ t })}
          data={data}
          // style
          style={DefaultProps.style}
          // icons
          icons={tableIcons({ theme })}
          // options
          options={{
            ...DefaultProps.options,
            filtering: true,
            grouping: true,
            selection: false
          }}
          // detailPanel
          detailPanel={[
            {
              icon: "code",
              render: rowData => {
                if (!rowData.columns) {
                  return (
                    <div className="bg-icon-muted px-8 py-3 text-white">
                      {rowData.columns || rowData.customized
                        ? "CUSTOMIZED"
                        : "EMPTY"}
                    </div>
                  )
                } else {
                  return (
                    <div style={{ background: JSON_VIEW_BG }} className="p-4">
                      {rowData.columns || ""}
                    </div>
                  )
                }
              }
            }
          ]}
        />
      </>
    </>
  )
}
