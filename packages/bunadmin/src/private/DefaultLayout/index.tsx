import React, { useEffect, useState } from "react"
import clsx from "clsx"
import Drawer from "@mui/material/Drawer"
import Box from "@mui/material/Box"
import { createStyles, Theme, useTheme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import styles from "./styles"
import LeftMenu from "../../components/LeftMenu"
import TopBar from "../../components/TopBar"
import { Container, Fade, useMediaQuery } from "@mui/material"
import { DefaultLayoutProps } from "@/components"
import { ENV, store } from "@/utils"

/**
 * !DO NOT export DefaultLayout in @xbuilder/bunadmin
 * Due to the dynamic import of aliases (@plugin) and customized elements
 * DefaultLayout needs to be defined in each project.
 * @param props
 * @constructor
 */
export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children, leftMenu } = props
  const theme = useTheme()
  const [open, setOpen] = React.useState(true)
  const phoneVertical = useMediaQuery("(max-width:640px)")
  const classes = makeStyles((theme: Theme) =>
    createStyles(styles({ theme, drawerOpen: open, phoneVertical }))
  )()

  const [NotifyTable, setNotifyTable] = useState<JSX.Element>()
  const [notifyCount, setNotifyCount] = useState<() => Promise<number>>()

  useEffect(() => {
    ;(async () => {
      if (!ENV.NOTIFICATION_PLUGIN) return
      const customNotificationPath = ENV.NOTIFICATION_PLUGIN
      const { NotificationTable, notificationCount } = await import(
        `../../.bunadmin/dynamic/${customNotificationPath}`
      )
      if (!NotificationTable || !notificationCount) return
      setNotifyTable(NotificationTable)
      setNotifyCount(notificationCount)
    })()
  }, [])

  return (
    <div className={classes.root}>
      <TopBar
        store={store}
        menuClick={handleDrawerToggle}
        notificationCount={notifyCount}
        NotificationTable={NotifyTable}
      />
      <Box display="flex">
        <nav aria-label="left menus">
          <Drawer
            PaperProps={{
              elevation: 0
            }}
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open
            })}
            classes={{
              paper: clsx(classes.pager, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open
              })
            }}
            anchor={theme.direction === "rtl" ? "right" : "left"}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            <LeftMenu {...leftMenu} />
          </Drawer>
        </nav>
        <Container className={classes.content}>
          <Fade in>
            <Box boxShadow={1} className={classes.contentBox}>
              {children}
            </Box>
          </Fade>
        </Container>
      </Box>
    </div>
  )

  function handleDrawerToggle() {
    setOpen(!open)
  }
}
