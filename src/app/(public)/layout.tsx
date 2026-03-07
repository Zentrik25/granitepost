import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getTopLevelCategories } from '@/lib/queries/categories'
import { getSiteSettings } from '@/lib/settings/queries'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [categories, settings] = await Promise.all([
    getTopLevelCategories(),
    getSiteSettings(),
  ])

  return (
    <>
      <Header categories={categories} settings={settings} />
      <main id="main-content">{children}</main>
      <Footer categories={categories} settings={settings} />
    </>
  )
}
