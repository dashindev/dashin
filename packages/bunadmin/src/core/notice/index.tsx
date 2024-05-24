import React, { useEffect, useState } from "react"

import { useTheme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"

import Table, { TableHead } from "@/components/Table"
import tableIcons from "@/components/Table/models/tableIcons"
import { Columns } from "./columns"
import { Schema } from "./schema"
import { editableController } from "./controllers/editableController"
import ConfirmDialog from "@/components/Dialog/ConfirmDialog"
import { Type } from "./types"
import { useTranslation } from "react-i18next"
import NoticeTabs from "./components/NoticeTabs"
import { ENV, NoticePlugin } from "@/utils"
import { Drawer } from "@/components"
import { useSelector } from "react-redux"
import { resetNotifyDrawer, selectNotice } from "@/slices"
import { BA_DB, INotification } from "@/utils/database"
import { EnhancedStore, AnyAction } from "@reduxjs/toolkit"
import { ThunkMiddlewareFor } from "@reduxjs/toolkit/dist/getDefaultMiddleware"

type Props = {
  store: EnhancedStore<any, AnyAction, [ThunkMiddlewareFor<any>]>
  drawerWidth?: string
} & NoticePlugin

export default function NoticeContainer(props: Props) {
  const { t } = useTranslation("table")
  const theme = useTheme()
  const notice = useSelector(selectNotice)
  const [data, setData] = useState<INotification[]>([])
  const [selData, setSelData] = useState<Type[]>()
  const [modalState, setModalState] = useState({
    open: 0,
    title: "",
    msg: ""
  })
  const [CustomNotification, setCustomNotification] = useState()
  const [tab, setTab] = useState(0)

  const useStyles = makeStyles(() => ({
    root: {
      "& .MTableToolbar-title": {
        display: "none"
      }
    }
  }))
  const classes = useStyles()

  useEffect(() => {
    ;(async () => {
      if (!notice.showDrawer) return
      props.store.dispatch(resetNotifyDrawer())

      await queryList()

      try {
        if (!ENV.NOTIFICATION_PLUGIN) return
        // Handle dynamic import `plugins`
        const { NotificationTable, notificationCount }: NoticePlugin = props
        if (!NotificationTable || !notificationCount) return
        // @ts-ignore
        setCustomNotification(<NotificationTable />)
        const count = await notificationCount()

        setTab(count > 0 ? 1 : 0)
      } catch (e) {}
    })()
  }, [notice.showDrawer])

  async function queryList() {
    const data = await BA_DB.notifications.reverse().sortBy("created_at")
    setData(data)
  }

  return (
    <Drawer
      width={props.drawerWidth || "38%"}
      height="100%"
      direction="right"
      buttonTitle=""
      buttonHidden
      switchDrawer={notice.showDrawer}
    >
      <div className={CustomNotification && classes.root}>
        <>
          <TableHead title={t(Schema.title)} />
          {CustomNotification && <NoticeTabs t={t} tab={tab} setTab={setTab} />}
          {tab === 0 && (
            <Table
              title={t(Schema.title)}
              columns={Columns({ t })}
              editable={editableController({ queryList })}
              data={data}
              // style
              style={DefaultProps.style}
              // icons
              icons={tableIcons({ theme })}
              // options
              options={{ ...DefaultProps.options, filtering: true }}
              // actions
              actions={[
                {
                  tooltip: "Remove All Selected Notices",
                  icon: "delete",
                  onClick: (_evt, data) => {
                    data = data as Type[]
                    const msg =
                      "Do you want to delete " + data.length + " rows ?"
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
              detailPanel={rowData => {
                return (
                  <div
                    style={{
                      color: "white",
                      backgroundColor: theme.bunadmin.iconColor,
                      padding: "10px 30px"
                    }}
                  >
                    {rowData.content || "CONTENT IS EMPTY"}
                  </div>
                )
              }}
            />
          )}
          {tab === 1 && CustomNotification && CustomNotification}
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

                  const query = db.notifications.where("id").equals(item.id)

                  await query.delete()
                  await queryList()
                } catch (e) {
                  console.error(e)
                }
              })
            }
          }}
        />
      </div>
    </Drawer>
  )
}
