import React from "react"
import clsx from "clsx"
import Drawer from "@material-ui/core/Drawer"
import Box from "@material-ui/core/Box"
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from "@material-ui/core/styles"
import styles from "./styles"
import LeftMenu from "../../components/LeftMenu"
import TopBar from "../../components/TopBar"
import { Container, Fade, useMediaQuery } from "@material-ui/core"
import { DefaultLayoutProps } from "@/components"

/**
 * !DO NOT export DefaultLayout in @bunred/bunadmin
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

  return (
    <div className={classes.root}>
      <TopBar menuClick={handleDrawerToggle} />
      <Box display="flex">
        <nav aria-label="mailbox folders">
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
