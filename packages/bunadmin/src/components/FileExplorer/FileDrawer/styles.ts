import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"

export const useStyles = makeStyles((theme: Theme) =>
  ({
    files: {
      display: "flex",
      justifyContent: "center"
    },
    filesNoDrawer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "flex-start"
    },
    filesItem: {
      marginRight: theme.spacing(3)
    },
    // draggable
    draggableList: {
      borderColor: theme.palette.primary.main,
      borderStyle: "dashed",
      display: "flex",
      flexWrap: "wrap"
      // overflow: "auto",
      // overflowX: "auto"
    },
    draggableItem: {
      userSelect: "none",
      padding: 0,
      margin: 0
    }
  })
)
