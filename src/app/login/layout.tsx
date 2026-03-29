import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminThemeProvider } from "@/components/admin-theme-provider"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Simple MVP protection
  const cookieStore = await cookies()
  const masterKey = cookieStore.get("certa_admin_session")

  const theme = cookieStore.get("certa-admin-theme")?.value as any || "neutral"
  const mode = cookieStore.get("certa-admin-mode")?.value as any || "light"

  if (!masterKey || masterKey.value !== "true") {
    redirect("/login")
  }

  return (
    <div
      className={`${inter.variable} antialiased min-h-screen`}
      style={{ "--font-sans": "var(--font-inter)" } as React.CSSProperties}
    >
      <AdminThemeProvider initialTheme={theme} initialMode={mode} fontClass={inter.variable}>
        {children}
      </AdminThemeProvider>
    </div>
  )
}
