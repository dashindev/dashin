import React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

interface Props {
  value: string
}

export default function RtPreviewer(props: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: props.value || "",
    editable: false
  })

  return (
    <EditorContent
      editor={editor}
      className="h-[calc(100vh-138px)] overflow-auto p-3 text-base [&_.ProseMirror]:outline-none"
    />
  )
}
