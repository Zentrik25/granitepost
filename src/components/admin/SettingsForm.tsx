'use client'

import { useState, useTransition } from 'react'
import { saveSettings } from '@/app/(admin)/admin/settings/actions'

interface SettingsFormProps {
  settings: Record<string, string>
}

const SETTING_FIELDS = [
  { key: 'site_name',           label: 'Site Name',                       type: 'text'  },
  { key: 'site_description',    label: 'Site Description',                type: 'text'  },
  { key: 'contact_email',       label: 'Contact Email',                   type: 'email' },
  { key: 'whatsapp_url',        label: 'WhatsApp Channel URL',            type: 'url'   },
  { key: 'twitter_handle',      label: 'Twitter / X Handle (no @)',       type: 'text'  },
  { key: 'facebook_url',        label: 'Facebook Page URL',               type: 'url'   },
  { key: 'comments_enabled',    label: 'Comments Enabled (true/false)',   type: 'text'  },
  { key: 'newsletter_enabled',  label: 'Newsletter Enabled (true/false)', type: 'text'  },
] as const

type FieldKey = (typeof SETTING_FIELDS)[number]['key']

// Shared admin input class
const INPUT = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-granite-primary/25 focus:border-granite-primary transition-colors bg-white'

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Record<FieldKey, string>>(
    SETTING_FIELDS.reduce(
      (acc, f) => ({ ...acc, [f.key]: settings[f.key] ?? '' }),
      {} as Record<FieldKey, string>
    )
  )

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await saveSettings(form)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
          Settings saved. Public pages will reflect changes on next load.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        {SETTING_FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="block text-xs font-semibold text-gray-600 mb-1.5">
              {f.label}
            </label>
            <input
              id={f.key}
              type={f.type}
              value={form[f.key] ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className={INPUT}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 text-white font-bold text-sm rounded-xl hover:brightness-110 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)' }}
      >
        {isPending ? 'Saving…' : 'Save Settings'}
      </button>
    </form>
  )
}