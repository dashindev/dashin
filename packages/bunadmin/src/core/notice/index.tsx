import React, { useEffect, useState } from "react"

import { createStyles, makeStyles, useTheme } from "@material-ui/core/styles"
import { TableDefaultProps as DefaultProps } from "@/components/Table/models/defaultProps"

import Table, { TableHead } from "@/components/Table"
import tableIcons from "@/components/Table/models/tableIcons"
import rxSubscribe from "@/utils/database/rxSubscribe"
import { Columns } from "./columns"
import { Schema } from "./schema"
import { editableController } from "./controllers/editableController"
import { Collection } from "./collections"
import ConfirmDialog from "@/components/Dialog/ConfirmDialog"
import rxDb from "@/utils/database/rxConnect"
import { Type } from "./types"
import { useTranslation } from "react-i18next"
import NoticeTabs from "./components/NoticeTabs"
import { ENV, NoticePlugin } from "@/utils"
import { Drawer } from "@/components"
import { useSelector } from "react-redux"
import { selectNotice } from "@/slices"

type Props = {
  drawerWidth?: string
} & NoticePlugin

export default function NoticeContainer(props: Props) {
  const { t } = useTranslation("table")
  const theme = useTheme()
  const notice = useSelector(selectNotice)
  const [data, setData] = useState([])
  const [selData, setSelData] = useState<Type[]>()
  const [modalState, setModalState] = useState({
    open: 0,
    title: "",
    msg: ""
  })
  const [CustomNotification, setCustomNotification] = useState()
  const [tab, setTab] = useState(0)

  const useStyles = makeStyles(() =>
    createStyles({
      root: {
        "& .MTableToolbar-title": {
          display: "none"
        }
      }
    })
  )
  const classes = useStyles()

  useEffect(() => {
    ;(async () => {
      // Subscribe to keep real-time data when received or deleted local messages
      await rxSubscribe({
        collection: Collection.name,
        sort: { created_at: "desc" },
        callback: data => setData(data)
      })
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
  }, [])

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
              editable={editableController()}
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
                  const db = await rxDb()

                  const query = db[Collection.name]
                    .findOne()
                    .where("id")
                    .eq(item.id)

                  await query.remove()
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
