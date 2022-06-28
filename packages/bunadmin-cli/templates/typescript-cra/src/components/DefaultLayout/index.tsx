import React, { useEffect, useState } from "react"
import clsx from "clsx"
import { Box, Container, Drawer, Fade, useMediaQuery } from "@material-ui/core"
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from "@material-ui/core/styles"
import styles from "./styles"
import {
  TopBar,
  LeftMenu,
  DefaultLayoutProps,
  ENV,
  store
} from "@bunred/bunadmin"

export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children, leftMenu } = props
  const theme = useTheme()
  const [open, setOpen] = React.useState(true)
  const phoneVertical = useMediaQuery("(max-width:640px)")
  const classes = makeStyles((theme: Theme) =>
    createStyles(styles({ theme, drawerOpen: open, phoneVertical }))
  )()

  const [notifyTable, setNotifyTable] = useState<JSX.Element>()
  const [notifyCount, setNotifyCount] = useState<() => Promise<number>>()

  useEffect(() => {
    ;(async () => {
      if (!ENV.NOTIFICATION_PLUGIN) return
      const customNotificationPath = ENV.NOTIFICATION_PLUGIN
      const { NotificationTable, notificationCount } = await import(
        `../../plugins/${customNotificationPath}`
      )
      if (!NotificationTable || !notificationCount) return
      setNotifyTable(notifyTable)
      setNotifyCount(notificationCount)
    })()
  }, [])

  return (
    <div className={classes.root}>
      <TopBar
        store={store}
        menuClick={handleDrawerToggle}
        notificationCount={notifyCount}
        NotificationTable={notifyTable}
      />
      <Box display="flex">
        <nav aria-label="left menus">
          <Drawer
            PaperProps={{
              elevation: 1
            }}
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open
            })}
            classes={{
              paper: clsx({
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
