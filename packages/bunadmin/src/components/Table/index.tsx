import React, { useEffect, useRef, useState } from "react"

import MaterialTable from "material-table"
import { useTheme } from "@material-ui/core/styles"
import tableIcons from "./models/tableIcons"
import { TableProps } from "@/components"
import { TableDefaultProps as DefaultProps } from "./models/defaultProps"
import { useTranslation } from "react-i18next"
import localization from "@/components/Table/localization"
import { ENV, DynamicRoute } from "@/utils"
import { useRouter } from "@/router"

export function TableHead({ title }: { title?: string }) {
  useEffect(() => {
    document.title = `${title || "List"} - ${ENV.SITE_NAME}`
  }, [])

  return <></>
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export default function Table<RowData extends object>(
  props: TableProps<RowData>
) {
  const { t } = useTranslation("table")
  const ref = useRef(null)
  const theme = useTheme()
  const router = useRouter()
  const { group: qGroup, name: qName } = router.query
  const [isLoading, setIsLoading] = useState<undefined | boolean>(true) // show progress

  useEffect(() => {
    ;(async () => {
      /**
       * Dynamic fixed column width
       */

      // Local data
      if (typeof props.data === "object") {
        setIsLoading(false)
      } else {
        // Remote data
        await delay(600)
        setIsLoading(undefined) // default with request response
      }

      if (!ref || !ref.current) return
      const doc = (ref.current as unknown) as Element

      const table = doc.querySelector("table")
      if (!table) return
      const thead_columns = table.querySelector("thead > tr")?.children
      const tbody_list = table.querySelectorAll("tbody > tr")
      if (!thead_columns || !tbody_list) return

      const filter_columns = tbody_list[0]?.children
      const body_columns = tbody_list[1]?.children

      if (!filter_columns || !body_columns) return
      if (
        !thead_columns.length !== !filter_columns.length ||
        !thead_columns.length !== !body_columns.length
      )
        return

      // Update thead/body column width by filter_column with
      for (let index = 0; index < body_columns.length; index++) {
        const body_column = (body_columns[index] as unknown) as Element

        const thead_column = thead_columns[index]
        const filter_column = filter_columns[index]

        if (!thead_column || !filter_column || !body_column) continue

        const colum_width = body_column.getBoundingClientRect().width

        // No records to display
        if (colum_width === tbody_list[0]?.getBoundingClientRect().width) {
          break
        }

        // @ts-ignore
        thead_column.style.width = colum_width + "px"
        // @ts-ignore
        filter_column.style.width = colum_width + "px"
      }
    })()
  }, [ref])

  return (
    <div id="bunadmin-table" ref={ref}>
      <MaterialTable
        isLoading={isLoading}
        // style
        style={DefaultProps.style}
        // localization props
        localization={localization({ t })}
        // icons
        icons={tableIcons({ theme })}
        // options
        options={{ ...DefaultProps.options, selection: false }}
        // actions
        actions={[
          {
            icon: "refresh",
            tooltip: t("Refresh Data"),
            isFreeAction: true,
            onClick: () => router.push(DynamicRoute, `/${qGroup}/${qName}`)
          }
        ]}
        // more props
        {...props}
      />
    </div>
  )
}
