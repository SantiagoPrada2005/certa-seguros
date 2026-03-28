"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type ActionState = { error: string } | null;

export async function submitMasterKey(prevState: ActionState, formData: FormData) {
  const masterKey = formData.get("masterKey") as string
  
  // Hardcoded MVP Key, defined in the prompt as "clave maestra alfanumérica"
  // E.g. "CertaMVP2026"
  if (masterKey === "CertaMVP2026") {
    const cookieStore = await cookies()
    cookieStore.set("certa_admin_session", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    
    redirect("/admin")
  }
  
  return { error: "Clave incorrecta." }
}
