import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"

export const HEADER_HEIGHT: number = 46
export const topBarStyles = makeStyles((theme: Theme) => {
  return {
    appBar: {
      [theme.breakpoints.up("sm")]: {
        zIndex: theme.zIndex.drawer + 1
      }
    },
    menuButton: {
      marginRight: theme.spacing(0)
    },
    toolbar: {
      [theme.breakpoints.up("sm")]: {
        justifyContent: "space-between"
      }
    },
    gutters: {
      paddingLeft: 20,
      minHeight: HEADER_HEIGHT
    },
    leftBlock: {
      display: "flex",
      alignItems: "center"
    },
    rightBlock: {
      display: "flex",
      alignItems: "center"
    }
  }
})
