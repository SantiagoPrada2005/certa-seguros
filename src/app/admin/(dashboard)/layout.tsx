import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminThemeProvider } from "@/components/admin-theme-provider"
import { AdminThemeSwitcher } from "@/components/admin-theme-switcher"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Simple MVP protection
  const cookieStore = await cookies()
  const masterKey = cookieStore.get("certa_admin_session")

  const theme = cookieStore.get("certa-admin-theme")?.value as any || "neutral"
  const mode = cookieStore.get("certa-admin-mode")?.value as any || "light"

  if (!masterKey || masterKey.value !== "true") {
    redirect("/admin/login")
  }

  return (
    <div 
      className={`${inter.variable} antialiased min-h-screen`}
      style={{ "--font-sans": "var(--font-inter)" } as React.CSSProperties}
    >
      <AdminThemeProvider initialTheme={theme} initialMode={mode} fontClass={inter.variable}>
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/admin">Certa Seguros Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2">
                <AdminThemeSwitcher />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:p-8 pt-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AdminThemeProvider>
    </div>
  )
}

