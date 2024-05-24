import React, { useEffect, useState } from "react"
import { RichTextReadOnly } from "mui-tiptap"
import StarterKit from "@tiptap/starter-kit"
import { ThemeProvider, Theme, StyledEngineProvider } from "@mui/material/styles";
import { defaultTheme } from "@xbuilder/bunadmin"


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


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
    setContent(html)
  }, [])

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={newTheme}>
        <RichTextReadOnly
          content={content} // Initial content for the editor
          extensions={[StarterKit]}
        />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
