import React from "react"

import Table, { TableHead } from "@/components/Table"

import { Schema } from "./schema"
import { Columns } from "./columns"

import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"
import tableIcons from "@/components/Table/models/tableIcons"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import { Type } from "@/core/menu/types"
import { selectNestedMenu } from "@/slices/nestedMenuSlice"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function LocalLeftMenuContainer() {
  const { t } = useTranslation("table")
  let data = useSelector(selectNestedMenu)
  data = data.map((item: Type) => ({ ...item }))

  return (
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
        options={{ ...DefaultProps.options, selection: false }}
      />
    </>
  )
}
