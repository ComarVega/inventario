import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { getActiveWarehouseId, getWarehouses } from "@/server/warehouses"
import { requireUser } from "@/server/auth"
import { redirect } from "next/navigation"
import { getSystemSettings } from "@/server/system-settings"
import { ThemeProvider } from "@/components/theme-provider"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  const user = await requireUser().catch(() => {
    redirect(`/${locale}/login`)
  })

  const warehouses = await getWarehouses()
  const activeWarehouseId = await getActiveWarehouseId()
  const settings = await getSystemSettings()

  return (
    <ThemeProvider initialTheme={settings.theme as 'light' | 'dark'}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex">
          <Sidebar locale={locale} userRole={user.role} />

          <div className="flex-1">
            <DashboardHeader 
              warehouses={warehouses} 
              activeWarehouseId={activeWarehouseId}
              user={user}
              locale={locale}
            />

            <main className="p-6">{children}</main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
