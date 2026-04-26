import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminThemeProvider } from "@/components/admin-theme-provider"
import { Inter } from "next/font/google"
import { adminAuth } from "@/lib/firebase/admin"
import prisma from "@/lib/prisma"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()

  // --- Authorization check ---
  const sessionCookie = cookieStore.get("firebase_session")
  if (!sessionCookie?.value) redirect("/login")

  try {
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie.value)
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { role: true, isActive: true },
    })

    if (!user || !user.isActive || user.role !== "ADMIN") {
      redirect("/unauthorized")
    }
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e
    cookieStore.delete("firebase_session")
    redirect("/login")
  }

  const theme = cookieStore.get("certa-admin-theme")?.value as any || "neutral"
  const mode = cookieStore.get("certa-admin-mode")?.value as any || "light"

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
