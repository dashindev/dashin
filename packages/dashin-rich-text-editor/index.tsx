import React, { Suspense, lazy } from "react"
import { Drawer, DrawerProps } from "@dashin-dev/dashin"
import { EditComponentProps } from "@dashin-dev/dashin"

// Lazy so the heavy @tiptap bundle is only loaded when a drawer actually opens.
// Typed loosely (any props) because React.lazy collapses the editor's generic.
const RtEditor = lazy(() => import("./editor")) as React.ComponentType<any>
const RtPreviewer = lazy(() => import("./previewer")) as React.ComponentType<{
  value: string
}>

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
      <div>
        <h1 className="mb-2 text-xl font-medium">{title}</h1>
      </div>
      <hr className="border-gray-200" />
      <Suspense fallback={<div className="p-3 text-sm text-gray-400">…</div>}>
        {props.previewValue && <RtPreviewer value={props.previewValue} />}
        {props.editProps && <RtEditor {...props.editProps} />}
      </Suspense>
    </Drawer>
  )
}
