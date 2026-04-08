"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminAuth } from "@/lib/firebase/admin"
import prisma from "@/lib/prisma"

type ActionState = { error: string } | null;

export async function createSession(idToken: string) {
  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (!decodedToken) {
      return { error: "Token inválido." };
    }

    // Sync with the database
    const { uid, email, name, picture } = decodedToken;
    
    if (!email) {
      return { error: "El token de Firebase no contiene un email válido." };
    }

    await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email: email,
        name: name || email.split("@")[0],
        avatarUrl: picture || null,
      },
      create: {
        firebaseUid: uid,
        email: email,
        name: name || email.split("@")[0],
        avatarUrl: picture || null,
        role: "VIEWER", // Default role as requested
      },
    });

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
    console.error("Error sync/session creation:", error);
    return { error: "Error de sincronización con la base de datos." };
  }
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete("firebase_session");
  redirect("/login");
}
