import React, { useEffect } from "react"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { EditComponentProps } from "@xbuilder/bunadmin"

interface Props<T extends object> extends EditComponentProps<T> {}

const btn = (active?: boolean) =>
  `rounded px-2 py-1 text-sm ${
    active ? "bg-primary text-white" : "hover:bg-content-bg"
  }`

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-primary p-2">
      <select
        className="rounded border border-gray-300 px-1 py-1 text-sm"
        value={
          editor.isActive("heading", { level: 1 })
            ? "1"
            : editor.isActive("heading", { level: 2 })
            ? "2"
            : editor.isActive("heading", { level: 3 })
            ? "3"
            : "0"
        }
        onChange={e => {
          const v = e.target.value
          if (v === "0") editor.chain().focus().setParagraph().run()
          else
            editor
              .chain()
              .focus()
              .toggleHeading({ level: Number(v) as 1 | 2 | 3 })
              .run()
        }}
      >
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
      <button
        type="button"
        className={btn(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className={btn(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className={btn(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        type="button"
        className={btn(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
      <button
        type="button"
        className={btn(editor.isActive("blockquote"))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        Quote
      </button>
      <button
        type="button"
        className={btn(editor.isActive("codeBlock"))}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        Code
      </button>
      <button
        type="button"
        className={btn(editor.isActive("link"))}
        onClick={() => {
          const href = window.prompt("Enter URL")
          if (href)
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
        }}
      >
        Link
      </button>
      <button
        type="button"
        className={btn()}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        Unlink
      </button>
      <button
        type="button"
        className={btn()}
        onClick={() => {
          const src = window.prompt("Enter image URL")
          if (src) editor.chain().focus().setImage({ src }).run()
        }}
      >
        Image
      </button>
      <button
        type="button"
        className={btn()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        Undo
      </button>
      <button
        type="button"
        className={btn()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        Redo
      </button>
    </div>
  )
}

export default function RtEditor<T extends object>(props: Props<T>) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content: props.value || ""
  })

  useEffect(() => {
    if (editor && props.value) editor.commands.setContent(props.value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  const handleClick = () => {
    const html = editor?.getHTML() || ""
    props.onChange(html)
    props.onRowDataChange({ ...props.rowData, content: html })
  }

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="h-[calc(100vh-138px)] overflow-auto p-3 text-base [&_.ProseMirror]:outline-none"
      />
      <button
        type="button"
        onClick={handleClick}
        className="m-2 rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90"
      >
        Save
      </button>
    </div>
  )
}
