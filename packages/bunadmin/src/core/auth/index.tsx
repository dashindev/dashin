import React, { useEffect, useState } from "react"

import { useTheme } from "@material-ui/core/styles"
import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"

import Table, { TableHead } from "@/components/Table"
import tableIcons from "@/components/Table/models/tableIcons"
import { Columns } from "./columns"
import ConfirmDialog from "@/components/Dialog/ConfirmDialog"
import { Type } from "./types"
import { Box, Button } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { JSON_VIEW_BG } from "@/utils/themes/defaultTheme"
import { BA_DB, IUser } from "@/utils/database"
import { AuthPrimary, SETTING_NAMES } from "@/main"

const Primary = AuthPrimary

export default function AuthInfoContainer() {
  const { t } = useTranslation("table")
  const theme = useTheme()
  const [data, setData] = useState<IUser[]>([])
  const [selData, setSelData] = useState<Type[]>()
  const [modalState, setModalState] = useState({
    open: 0,
    title: "",
    msg: ""
  })

  useEffect(() => {
    ;(async () => {
      const user = await BA_DB.users.reverse().sortBy("updated_at")
      setData(user)
    })()
  }, [])

  return (
    <>
      <>
        <TableHead title={t("Authentication")} />
        <Table
          title={t("Authentication")}
          columns={Columns({ t })}
          data={data}
          // style
          style={DefaultProps.style}
          // icons
          icons={tableIcons({ theme })}
          // options
          options={{ ...DefaultProps.options, filtering: true, grouping: true }}
          // actions
          actions={[
            {
              tooltip: "Remove All Selected Items",
              icon: "delete",
              onClick: (_evt, data) => {
                data = data as Type[]
                const msg = "Do you want to delete " + data.length + " rows ?"
                setModalState({
                  title: "Bulk delete",
                  open: modalState.open + 1,
                  msg
                })
                setSelData(data)
              }
            }
          ]}
          // detailPanel
          detailPanel={[
            {
              icon: "assignment_ind",
              render: rowData => {
                if (!rowData.details) {
                  return (
                    <div
                      style={{
                        color: "white",
                        backgroundColor: theme.bunadmin.iconColor,
                        padding: "10px 30px"
                      }}
                    >
                      {rowData.details || "EMPTY"}
                    </div>
                  )
                } else {
                  return (
                    <Box style={{ background: JSON_VIEW_BG }} p={2}>
                      {rowData.details || ""}
                    </Box>
                  )
                } // check columns
              } // render
            }, // item
            {
              icon: "sync_alt",
              render: rowData => {
                return (
                  <Box p={3}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={async () => {
                        const db = BA_DB
                        // Insert to setting: username
                        await db.settings.put({
                          name: Primary,
                          value: rowData[Primary],
                          updated_at: Date.now()
                        })
                        // Insert to setting: role
                        await db.settings.put({
                          name: SETTING_NAMES.role,
                          value: rowData["role"],
                          updated_at: Date.now()
                        })
                        window.location.reload()
                      }}
                    >
                      Switch to {rowData[Primary]}
                    </Button>
                  </Box>
                )
              }
            }
          ]}
        />
      </>
      {/* ConfirmDialog */}
      <ConfirmDialog
        openModal={modalState.open}
        title={modalState.title}
        msg={modalState.msg}
        doFunc={() => {
          // bulk delete
          if (selData && selData.length > 0) {
            selData.map(async item => {
              try {
                const db = BA_DB

                const query = db.users.where(Primary).equals(item[Primary])

                await query.delete()
              } catch (e) {
                console.error(e)
              }
            })
          }
        }}
      />
    </>
  )
}
