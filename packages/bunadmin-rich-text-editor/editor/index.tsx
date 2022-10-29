import React, { useEffect, useState } from "react"
import MUIRichTextEditor from "mui-rte"
import { EditComponentProps } from "material-table"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { defaultTheme } from "@xbuilder/bunadmin"
import {
  EditorState,
  convertFromHTML,
  ContentState,
  convertToRaw
} from "draft-js"
import { stateToHTML } from "draft-js-export-html"

const newTheme = {
  ...defaultTheme,
  overrides: {
    MUIRichTextEditor: {
      root: {},
      toolbar: {
        overflowY: "scroll",
        width: "100%",
        height: 50,
        borderBottom: `1px solid ${defaultTheme.palette.primary.main}`
      },
      editor: {
        fontSize: 16,
        height: "calc(100vh - 138px)",
        overflow: "scroll"
      }
    },
    MuiButtonBase: {
      root: {
        // hide save button in toolbar
        "&#mui-rte-Save-button": { display: "none" }
      }
    }
  }
}

interface Props<T extends object> extends EditComponentProps<T> {}

export default function RtEditor<T extends object>(props: Props<T>) {
  const [content, setContent] = useState<string>("")

  const handleClick = (state: EditorState) => {
    const html = stateToHTML(state.getCurrentContent())
    props.onChange(html)
    props.onRowDataChange({
      ...props.rowData,
      content: html
    })
  }

  useEffect(() => {
    const html = props.value || ""
    const contentHTML = convertFromHTML(html)
    const state = ContentState.createFromBlockArray(
      contentHTML.contentBlocks,
      contentHTML.entityMap
    )
    const defaultContent = JSON.stringify(convertToRaw(state))
    setContent(defaultContent)
  }, [])

  return (
    <MuiThemeProvider theme={newTheme}>
      <MUIRichTextEditor
        label="Start typing..."
        defaultValue={content}
        onChange={handleClick}
      />
    </MuiThemeProvider>
  )
}
