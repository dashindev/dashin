import React, { useState,useEffect, useRef } from "react"
import { Button } from "@mui/material";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";
import StarterKit from "@tiptap/starter-kit";
import { EditComponentProps } from "material-table"
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
        "&#mui-editor-Save-button": { display: "none" }
      }
    }
  }
}

interface Props<T extends object> extends EditComponentProps<T> {}

export default function RtEditor<T extends object>(props: Props<T>) {
  const rteRef = useRef<RichTextEditorRef>(null);
  const [content, setContent] = useState<string>("Start typing...")

  useEffect(() => {
    const html = props.value || ""
    setContent(html)
  }, [])

  const handleClick = () => {
    const html = rteRef.current?.editor?.getHTML() || ""
    props.onChange(html)
    props.onRowDataChange({
      ...props.rowData,
      content: html
    })
    setContent(html)
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={newTheme}>
        <RichTextEditor
          ref={rteRef}
          content={content} // Initial content for the editor
          extensions={[StarterKit]}
          // Optionally include `renderControls` for a menu-bar atop the editor:
          renderControls={() => (
            <MenuControlsContainer>
              <MenuSelectHeading />
              <MenuDivider />
              <MenuButtonBold />
              <MenuButtonItalic />
              {/* Add more controls of your choosing here */}
            </MenuControlsContainer>
          )}
        />
              <Button onClick={handleClick}>
          Log HTML
        </Button>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
