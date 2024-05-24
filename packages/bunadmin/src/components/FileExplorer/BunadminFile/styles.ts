import { Theme } from "@mui/material"
import { StyleRules } from "@mui/styles/withStyles"

interface Props {
  theme: Theme
  id?: string
  width?: number
}

export default function styles({ theme, id, width }: Props): StyleRules {
  return {
    root: {
      width: width || theme.spacing(18.75) // 150
    },
    Card: {
      margin: id ? "20px 0" : "20px 5px 20px 0",
      borderWidth: 1,
      position: "relative"
    },
    DropZone: {
      width: "100%",
      height: "100%",
      position: "absolute",
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    BottomArea: {
      height: theme.spacing(4.5), // 36
      position: "absolute",
      zIndex: 2,
      width: "100%",
      bottom: 0,
      background: "#ffffff8a"
    },
    BottomButtons: {
      display: "flex",
      justifyContent: "space-evenly",
      width: "100%",
      padding: 0,
      paddingBottom: "0!important"
    },
    BottomIcon: {
      width: 21,
      height: 21,
      color: theme.palette.primary.light
    },
    DefaultUpload: {
      padding: 10
    },
    UploadText: {
      color: "#FFF",
      fontSize: 12,
      opacity: 0.6,
      textShadow: "1px 1px 10px #fff",
      maxWidth: theme.spacing(12.5),
      backgroundColor: "rgba(0, 0, 0, .5)",
      borderRadius: 5,
      padding: theme.spacing(0.5, 1),
      textAlign: "center"
    }
  }
}
