import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { updateProfileAction } from '@/app/(admin)/admin/authors/actions'
import { ProfileForm } from '@/components/admin/authors/ProfileForm'

export const metadata: Metadata = { title: 'Edit Author — Admin' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAuthorPage({ params }: Props) {
  const { id } = await params
  const { user, role } = await requireAuth()

  // Non-admin users can only see their own profile
  if (role !== 'ADMIN' && user.id !== id) {
    notFound()
  }

  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, slug, title, bio, twitter_handle, avatar_url')
    .eq('id', id)
    .single()

  if (error || !profile) notFound()

  const boundAction = updateProfileAction.bind(null, id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black">Edit Author</h1>
        <p className="text-xs font-mono text-brand-muted mt-0.5">{profile.id}</p>
      </div>

      <ProfileForm profile={profile} saveAction={boundAction} />
    </div>
  )
}
