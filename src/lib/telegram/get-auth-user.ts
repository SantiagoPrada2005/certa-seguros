import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import prisma from "@/lib/prisma";

/**
 * Obtiene el usuario autenticado actual desde la cookie de sesión.
 * Útil para server actions y API routes que necesitan identificar al usuario.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("firebase_session");

  if (!sessionCookie?.value) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie.value);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
    });
    return user;
  } catch {
    return null;
  }
}
