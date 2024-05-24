import { Theme } from "@mui/material"

interface Props {
  theme: Theme
  width?: number | string
  height?: number | string
}

export default function styles({ theme, width, height }: Props) {
  return {
    root: {
      display: "flex"
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1
    },
    drawer: {
      width,
      height,
      flexShrink: 0
    },
    drawerPaper: {
      width,
      height,
      padding: theme.spacing(3)
    },
    drawContent: {
      flexGrow: 1
    },
    toolbar: theme.mixins.toolbar
  }
}
