'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  defaultValue?: string
  name?: string
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`rounded px-2 py-1 text-sm transition-colors ${
        active
          ? 'bg-gray-800 text-white'
          : 'hover:bg-gray-200 text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ defaultValue = '', name = 'body_html' }: Props) {
  const [html, setHtml] = useState(defaultValue)
  const linkUrlRef = useRef('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ inline: false }),
    ],
    content: defaultValue,
    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[400px] px-4 py-3 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    return () => { editor?.destroy() }
  }, [editor])

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:', editor?.getAttributes('link').href ?? 'https://')
    if (!url) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL:', '')
    if (!url) return
    editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-brand-border bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-brand-border bg-gray-50 px-2 py-1.5">
        <ToolbarBtn title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <s>S</s>
        </ToolbarBtn>

        <span className="mx-1 border-l border-gray-300" />

        <ToolbarBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarBtn>

        <span className="mx-1 border-l border-gray-300" />

        <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </ToolbarBtn>
        <ToolbarBtn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </ToolbarBtn>
        <ToolbarBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </ToolbarBtn>

        <span className="mx-1 border-l border-gray-300" />

        <ToolbarBtn title="Insert link" active={editor.isActive('link')} onClick={addLink}>
          🔗 Link
        </ToolbarBtn>
        <ToolbarBtn title="Insert image from URL" active={false} onClick={addImage}>
          🖼 Image
        </ToolbarBtn>

        <span className="mx-1 border-l border-gray-300" />

        <ToolbarBtn title="Undo (Ctrl+Z)" active={false} onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </ToolbarBtn>
        <ToolbarBtn title="Redo (Ctrl+Y)" active={false} onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </ToolbarBtn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={html} />
    </div>
  )
}
