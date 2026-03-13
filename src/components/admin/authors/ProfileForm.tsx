'use client'

import { useActionState } from 'react'
import type { ProfileActionResult } from '@/app/(admin)/admin/authors/actions'

interface Profile {
  id: string
  full_name: string | null
  slug: string | null
  title: string | null
  bio: string | null
  twitter_handle: string | null
  avatar_url: string | null
}

type SaveAction = (
  state: ProfileActionResult,
  formData: FormData
) => Promise<ProfileActionResult>

interface Props {
  profile: Profile
  saveAction: SaveAction
}

const INITIAL: ProfileActionResult = { success: false }

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="mt-1 text-xs text-red-600">{errors[0]}</p>
}

export function ProfileForm({ profile, saveAction }: Props) {
  const [state, formAction, isPending] = useActionState(saveAction, INITIAL)
  const fe = state.fieldErrors as Record<string, string[] | undefined> | undefined

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {!isPending && state.error && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {!isPending && state.success && (
        <div role="status" className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved successfully.
        </div>
      )}

      <section className="space-y-4 border border-brand-border bg-white p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Identity</h2>

        <div>
          <label htmlFor="pf-name" className="mb-1 block text-xs font-semibold">
            Full name <span className="text-brand-red">*</span>
          </label>
          <input
            id="pf-name"
            name="full_name"
            type="text"
            required
            maxLength={200}
            defaultValue={profile.full_name ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.full_name} />
        </div>

        <div>
          <label htmlFor="pf-slug" className="mb-1 block text-xs font-semibold">
            Slug{' '}
            <span className="font-normal text-brand-muted">
              (required for public author page, e.g. <code className="text-xs">tendai-moyo</code>)
            </span>
          </label>
          <input
            id="pf-slug"
            name="slug"
            type="text"
            maxLength={200}
            defaultValue={profile.slug ?? ''}
            placeholder="tendai-moyo"
            className="w-full border border-brand-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.slug} />
          {!profile.slug && (
            <p className="mt-1 text-xs text-amber-600">
              Set a slug to enable the public author page at /author/[slug].
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pf-title" className="mb-1 block text-xs font-semibold">
            Title / Role{' '}
            <span className="font-normal text-brand-muted">(e.g. Senior Reporter, Sports Editor)</span>
          </label>
          <input
            id="pf-title"
            name="title"
            type="text"
            maxLength={200}
            defaultValue={profile.title ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.title} />
        </div>
      </section>

      <section className="space-y-4 border border-brand-border bg-white p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Bio & Contact</h2>

        <div>
          <label htmlFor="pf-bio" className="mb-1 block text-xs font-semibold">
            Bio
          </label>
          <textarea
            id="pf-bio"
            name="bio"
            rows={5}
            maxLength={2000}
            defaultValue={profile.bio ?? ''}
            placeholder="Short biography shown on the author page…"
            className="w-full resize-y border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.bio} />
        </div>

        <div>
          <label htmlFor="pf-twitter" className="mb-1 block text-xs font-semibold">
            X / Twitter handle{' '}
            <span className="font-normal text-brand-muted">(without @)</span>
          </label>
          <input
            id="pf-twitter"
            name="twitter_handle"
            type="text"
            maxLength={100}
            defaultValue={profile.twitter_handle ?? ''}
            placeholder="tendaimoyo"
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.twitter_handle} />
        </div>

        <div>
          <label htmlFor="pf-avatar" className="mb-1 block text-xs font-semibold">
            Avatar URL{' '}
            <span className="font-normal text-brand-muted">(paste a URL or upload via Media library)</span>
          </label>
          <input
            id="pf-avatar"
            name="avatar_url"
            type="url"
            defaultValue={profile.avatar_url ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.avatar_url} />
        </div>
      </section>

      <div className="sticky bottom-0 flex gap-3 border-t border-brand-border bg-gray-50 py-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-brand-red px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>
        <a
          href="/admin/authors"
          className="border border-brand-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-gray"
        >
          Cancel
        </a>
        {profile.slug && (
          <a
            href={`/author/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto border border-brand-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-gray"
          >
            View public page →
          </a>
        )}
      </div>
    </form>
  )
}
