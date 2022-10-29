import React from "react"
import { Drawer, DrawerProps } from "@xbuilder/bunadmin"
import { EditComponentProps } from "material-table"
import { Box, Typography, Divider } from "@material-ui/core"
import RtEditor from "./editor"
import RtPreviewer from "./previewer"

interface EditProps<T extends object> extends EditComponentProps<T> {}

export interface RichTextEditorProps<T extends object> {
  editProps?: EditProps<T>
  previewValue?: string
  title?: string
  drawerWidth?: DrawerProps["width"]
}

export function RichTextEditor<T extends object>(
  props: RichTextEditorProps<T>
) {
  const { editProps, drawerWidth = "50%" } = props
  const title = editProps ? props.title || "Edit" : props.title || "Preview"

  return (
    <Drawer
      width={drawerWidth}
      height="100%"
      direction="right"
      buttonTitle={title}
    >
      <Box>
        <Typography variant="h5" component="h1" gutterBottom>
          {title}
        </Typography>
      </Box>
      <Divider />
      {props.previewValue && <RtPreviewer value={props.previewValue} />}
      {props.editProps && <RtEditor {...props.editProps} />}
    </Drawer>
  )
}
