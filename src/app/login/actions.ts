"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminAuth } from "@/lib/firebase/admin"

type ActionState = { error: string } | null;

export async function createSession(idToken: string) {
  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (!decodedToken) {
      return { error: "Token inválido." };
    }

    // Set a session cookie for Middleware
    const cookieStore = await cookies();
    cookieStore.set("firebase_session", idToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating session:", error);
    return { error: "Error de autenticación en el servidor." };
  }
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete("firebase_session");
  redirect("/login");
}
