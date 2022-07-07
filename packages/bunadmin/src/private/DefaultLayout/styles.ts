import { Theme } from "@material-ui/core/styles"
import { StyleRules } from "@material-ui/styles/withStyles"

const drawerWidth = 240

interface Props {
  theme: Theme
  drawerOpen: boolean
  phoneVertical: boolean
}

export default function styles({
  theme,
  drawerOpen,
  phoneVertical
}: Props): StyleRules {
  return {
    root: {
      height: "-webkit-fill-available",
      background: "#fff",
      "& .MuiContainer-root": {
        borderTopLeftRadius: 10,
        height: "calc(100vh - 46px)", // minus the minHeight of TopBar
        maxWidth: phoneVertical
          ? "auto"
          : drawerOpen
          ? "calc(100vw - 240px)"
          : "calc(100vw - 73px)"
      }
    },
    drawer: {
      whiteSpace: "nowrap",
      [theme.breakpoints.up("sm")]: {
        width: drawerWidth,
        flexShrink: 0,
        height: "100%"
      }
    },
    drawerOpen: {
      width: drawerWidth,
      borderRight: "none",
      position: "relative",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerClose: {
      borderRight: "none",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      overflowX: "hidden",
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9) + 1
      }
    },
    pager: {
      position: "relative"
    },
    hide: {
      display: "none"
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth
    },
    content: {
      background: theme.bunadmin.contentBg,
      flexGrow: 1,
      padding: theme.spacing(4.5)
    },
    contentBox: {
      background: theme.bunadmin.contentBoxBg,
      overflow: "hidden",
      borderRadius: 10,
      height: "100%"
    },
    // table
    treeDataThHidden: {
      display: "none"
    }
  }
}
