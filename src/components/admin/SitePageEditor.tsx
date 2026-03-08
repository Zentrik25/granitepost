'use client'

import { useActionState, useRef, useState } from 'react'
import type { SitePage } from '@/types'

interface SitePageEditorProps {
  page: SitePage
  saveAction: (
    prevState: { error: string | null; success: boolean },
    formData: FormData,
  ) => Promise<{ error: string | null; success: boolean }>
}

// ── Toolbar button ─────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  label: string
  title: string
  onClick: () => void
}

function ToolbarButton({ label, title, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="px-2.5 py-1.5 text-xs font-semibold text-brand-secondary rounded hover:bg-brand-canvas hover:text-brand-primary border border-transparent hover:border-brand-border transition-all duration-100 whitespace-nowrap"
    >
      {label}
    </button>
  )
}

// ── Tag insertion helpers ──────────────────────────────────────────────────────

function wrapSelection(
  textarea: HTMLTextAreaElement,
  open: string,
  close: string,
  onChange: (v: string) => void,
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.substring(start, end)
  const before = textarea.value.substring(0, start)
  const after = textarea.value.substring(end)
  const replacement = `${open}${selected || 'text'}${close}`
  const next = before + replacement + after
  onChange(next)
  // Restore selection inside the inserted tags
  requestAnimationFrame(() => {
    textarea.focus()
    const cursor = start + open.length + (selected || 'text').length
    textarea.setSelectionRange(cursor, cursor)
  })
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  html: string,
  onChange: (v: string) => void,
) {
  const start = textarea.selectionStart
  const before = textarea.value.substring(0, start)
  const after = textarea.value.substring(start)
  onChange(before + html + after)
  requestAnimationFrame(() => {
    textarea.focus()
    const cursor = start + html.length
    textarea.setSelectionRange(cursor, cursor)
  })
}

// ── Main editor ───────────────────────────────────────────────────────────────

export function SitePageEditor({ page, saveAction }: SitePageEditorProps) {
  const [title, setTitle] = useState(page.title)
  const [metaDesc, setMetaDesc] = useState(page.meta_description ?? '')
  const [html, setHtml] = useState(page.content_html)
  const [preview, setPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [formState, formAction, isPending] = useActionState(saveAction, {
    error: null,
    success: false,
  })

  function getTextarea() {
    return textareaRef.current!
  }

  // Toolbar actions
  const toolbar = [
    { label: 'B',           title: 'Bold',        action: () => wrapSelection(getTextarea(), '<strong>', '</strong>', setHtml) },
    { label: 'I',           title: 'Italic',       action: () => wrapSelection(getTextarea(), '<em>', '</em>', setHtml) },
    { label: 'H2',          title: 'Heading 2',    action: () => wrapSelection(getTextarea(), '<h2>', '</h2>', setHtml) },
    { label: 'H3',          title: 'Heading 3',    action: () => wrapSelection(getTextarea(), '<h3>', '</h3>', setHtml) },
    { label: 'P',           title: 'Paragraph',    action: () => wrapSelection(getTextarea(), '<p>', '</p>', setHtml) },
    { label: 'UL',          title: 'Bullet list',  action: () => wrapSelection(getTextarea(), '<ul>\n<li>', '</li>\n</ul>', setHtml) },
    { label: 'OL',          title: 'Numbered list',action: () => wrapSelection(getTextarea(), '<ol>\n<li>', '</li>\n</ol>', setHtml) },
    { label: 'LI',          title: 'List item',    action: () => wrapSelection(getTextarea(), '<li>', '</li>', setHtml) },
    { label: '"',           title: 'Blockquote',   action: () => wrapSelection(getTextarea(), '<blockquote>', '</blockquote>', setHtml) },
    { label: 'Link',        title: 'Hyperlink',    action: () => {
      const url = window.prompt('Enter URL:', 'https://')
      if (url) wrapSelection(getTextarea(), `<a href="${url}">`, '</a>', setHtml)
    }},
    { label: '—',           title: 'Horizontal rule', action: () => insertAtCursor(getTextarea(), '\n<hr />\n', setHtml) },
  ]

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden fields */}
      <input type="hidden" name="content_html" value={html} />

      {/* Page metadata card */}
      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm p-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-brand-secondary uppercase tracking-wider mb-1.5">
            Page Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-4 text-sm font-semibold rounded-lg border border-brand-border bg-brand-canvas focus:outline-none focus:ring-2 focus:ring-brand-ink/20 focus:border-brand-ink text-brand-primary transition-colors"
            placeholder="Page title"
          />
        </div>

        <div>
          <label htmlFor="meta_description" className="block text-xs font-semibold text-brand-secondary uppercase tracking-wider mb-1.5">
            Meta Description
            <span className="ml-2 normal-case font-normal text-brand-muted">(used for SEO and search results)</span>
          </label>
          <input
            id="meta_description"
            name="meta_description"
            type="text"
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            maxLength={160}
            className="w-full h-11 px-4 text-sm rounded-lg border border-brand-border bg-brand-canvas focus:outline-none focus:ring-2 focus:ring-brand-ink/20 focus:border-brand-ink text-brand-primary transition-colors"
            placeholder="Brief description of this page (max 160 characters)"
          />
          <p className="text-[10px] text-brand-muted mt-1 text-right">{metaDesc.length}/160</p>
        </div>
      </div>

      {/* Content editor card */}
      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden">
        {/* Editor header */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-brand-border bg-brand-canvas/50">
          <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
            Page Content
          </span>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-xs font-semibold text-brand-ink hover:underline"
          >
            {preview ? '← Edit' : 'Preview →'}
          </button>
        </div>

        {preview ? (
          /* ── Preview panel ── */
          <div
            className="prose prose-sm max-w-none p-6 min-h-[400px] text-brand-primary"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          /* ── HTML editor ── */
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-brand-border bg-brand-canvas/30">
              {toolbar.map((btn) => (
                <ToolbarButton
                  key={btn.label}
                  label={btn.label}
                  title={btn.title}
                  onClick={btn.action}
                />
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={22}
              spellCheck={false}
              className="w-full px-5 py-4 text-[13px] font-mono leading-relaxed text-brand-primary bg-transparent resize-none focus:outline-none"
              placeholder="<p>Start writing HTML content here…</p>"
              aria-label="Page HTML content"
            />
          </>
        )}
      </div>

      {/* Status + save */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm">
          {formState.success && !isPending && (
            <p className="text-emerald-600 font-medium">Changes saved successfully.</p>
          )}
          {formState.error && !isPending && (
            <p className="text-red-500 font-medium">{formState.error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 active:brightness-95 transition-all duration-150"
          style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)' }}
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
