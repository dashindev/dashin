import React, { useEffect, useState } from "react"
import MUIRichTextEditor from "mui-rte"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { defaultTheme } from "@xbuilder/bunadmin"
import { convertFromHTML, ContentState, convertToRaw } from "draft-js"

const newTheme = {
  ...defaultTheme,
  overrides: {
    MUIRichTextEditor: {
      root: {},
      toolbar: {
        display: "none"
      },
      editor: {
        fontSize: 16,
        height: "calc(100vh - 138px)",
        overflow: "scroll"
      }
    }
  }
}

interface Props {
  value: string
}

export default function RtPreviewer(props: Props) {
  const [content, setContent] = useState<string>("")

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
        readOnly={true}
      />
    </MuiThemeProvider>
  )
}
