// Development connectivity check — remove or gate behind NODE_ENV before deploying.
// This page intentionally has no auth guard so you can test before auth is set up.

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Category } from '@/types/database'

export const revalidate = 60

export default async function TestSupabasePage() {
  let categories: Category[] = []
  let errorMessage: string | null = null
  let connected = false

  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, display_order, is_active, created_at, updated_at')
      .order('display_order', { ascending: true })
      .limit(20)

    if (error) {
      errorMessage = error.message
    } else {
      categories = (data ?? []) as Category[]
      connected = true
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Supabase connectivity test
      </h1>

      {/* Status badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          background: connected ? '#dcfce7' : '#fee2e2',
          color:      connected ? '#166534' : '#991b1b',
          border:     `1px solid ${connected ? '#86efac' : '#fca5a5'}`,
        }}
      >
        {connected ? '✓ Connected' : '✗ Connection failed'}
      </div>

      {/* Error */}
      {errorMessage && (
        <pre
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            padding: '1rem',
            color: '#991b1b',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            marginBottom: '1.5rem',
          }}
        >
          {errorMessage}
        </pre>
      )}

      {/* Results */}
      {connected && (
        <>
          <p style={{ marginBottom: '0.75rem', color: '#374151' }}>
            <strong>categories</strong> table — {categories.length} row{categories.length !== 1 ? 's' : ''} returned
          </p>

          {categories.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              No categories found. Run the seed migrations or insert a row to verify writes.
            </p>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8rem',
              }}
            >
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  {['id', 'name', 'slug', 'display_order', 'is_active', 'created_at'].map((h) => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr
                    key={cat.id}
                    style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                      {cat.id.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
                      {cat.name}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                      {cat.slug}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                      {cat.display_order}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                      {cat.is_active ? '✓' : '✗'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                      {new Date(cat.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#9ca3af' }}>
        Remove <code>src/app/test-supabase/</code> before deploying to production.
      </p>
    </main>
  )
}
