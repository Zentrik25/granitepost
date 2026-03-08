import { NavHeader } from '@/components/layout/NavHeader'
import { Footer } from '@/components/layout/Footer'
import { getAllCategories } from '@/lib/queries/categories'
import { getNavigationCategories } from '@/lib/queries/navigation'
import { getSiteSettings } from '@/lib/settings/queries'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [navCategories, allCategories, settings] = await Promise.all([
    getNavigationCategories(),
    getAllCategories(),
    getSiteSettings(),
  ])

  return (
    <>
      <NavHeader categories={navCategories} settings={settings} />
      <main id="main-content">{children}</main>
      <Footer categories={allCategories} settings={settings} />
    </>
  )
}
