import React, { useState } from "react"

import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"

import Table, { TableHead } from "@/components/Table"
import tableIcons from "@/components/Table/models/tableIcons"
import { Columns } from "./columns"
import { Schema } from "./schema"
import { useTranslation } from "react-i18next"
import { BA_DB, ISetting } from "@/utils/database"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function AuthInfoContainer() {
  const { t } = useTranslation("table")
  const [data, setData] = useState<ISetting[]>([])

  React.useEffect(() => {
    ;(async () => {
      const settings = await BA_DB.settings.toArray()
      setData(settings)
    })()
  }, [])

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
          options={{ ...DefaultProps.options, selection: false }}
        />
      </>
    </>
  )
}
