import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps,
  useTranslation,
  notice
} from "@dashin-dev/dashin"
import { SchemaLabel, SchemaColumns } from "./plugin"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function Post() {
  const { t } = useTranslation("table")
  const tableRef = createRef()

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table
        tableRef={tableRef}
        title={t(SchemaLabel)}
        columns={SchemaColumns()}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{
          ...DefaultProps.options,
          filtering: true
        }}
        data={query =>
          new Promise((resolve, _reject) => {
            let url = "https://reqres.in/api/users?"
            url += "per_page=" + query.pageSize
            url += "&page=" + (query.page + 1)
            fetch(url)
              .then(response => response.json())
              .then(result => {
                resolve({
                  data: [],
                  page: result.page - 1,
                  totalCount: result.total
                })
              })
          })
        }
        editable={{
          onRowAdd: async newData =>
            await notice({
              title: "test create",
              content: newData
            }),
          onRowUpdate: async (newData, oldData) =>
            await notice({
              title: "test update",
              content: { newData, oldData }
            }),
          onBulkUpdate: async changes =>
            await notice({
              title: "test bulk update",
              content: changes
            }),
          onRowDelete: async oldData =>
            await notice({
              title: "test delete",
              content: oldData
            })
        }}
        actions={[
          {
            icon: "refresh",
            tooltip: "Refresh Data",
            isFreeAction: true,
            //@ts-ignore
            onClick: () => tableRef.current && tableRef.current.onQueryChange()
          },
          {
            tooltip: "Remove All Selected Rows",
            icon: "delete",
            onClick: async (_evt, data) =>
              await notice({
                title: "test bulk delete",
                content: data
              })
          }
        ]}
      />
    </>
  )
}
