"use client"

import { useState, useEffect, useRef } from "react"
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { createSession } from "./actions"
import { SignInPage } from "@/components/ui/sign-in"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const redirectingRef = useRef(false)

  // Auto-redirect if already authenticated (e.g. token expired and layout redirected here)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && !redirectingRef.current) {
        redirectingRef.current = true
        try {
          const token = await authUser.getIdToken(true) // force refresh
          await createSession(token)
          window.location.href = "/admin"
        } catch (error) {
          console.error("Auto-login failed:", error)
          await auth.signOut() // Sync client state if server session is revoked
          redirectingRef.current = false
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const navigateToAdmin = () => {
    // Use full page navigation so the middleware reads the freshly-set cookie
    window.location.href = "/admin"
  }

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("masterKey") as string

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()

      const sessionResult = await createSession(token)

      if (sessionResult?.error) {
        throw new Error(sessionResult.error)
      }

      toast.success("Inicio de sesión exitoso")
      navigateToAdmin()
    } catch (err: any) {
      console.error("Login component error:", err)
      setError(err?.message || "Ocurrió un error al iniciar sesión.")
      toast.error("Error al iniciar sesión")
    } finally {
      setIsPending(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsPending(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const token = await userCredential.user.getIdToken()

      const sessionResult = await createSession(token)

      if (sessionResult?.error) {
        throw new Error(sessionResult.error)
      }

      toast.success("Sesión con Google exitosa")
      navigateToAdmin()
    } catch (err: any) {
      console.error("Google sign-in error:", err)
      setError(err?.message || "Ocurrió un error con Google.")
      toast.error("Error al iniciar sesión con Google")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <SignInPage
      title={
        <span className="font-semibold text-foreground tracking-tight">
          Certa <span className="text-primary">Seguros</span>
        </span>
      }
      description="Acceso exclusivo para administradores y asesores autorizados. Por favor, ingrese sus credenciales para continuar."
      heroImageSrc="/images/login-hero.png"
      passwordName="masterKey"
      emailLabel="Usuario Administrador"
      passwordLabel="Clave de Acceso"
      emailPlaceholder="ej. admin@certaseguros.com"
      passwordPlaceholder="Ingrese su contraseña..."
      onSignIn={handleEmailSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      isPending={isPending}
      error={error || undefined}
      testimonials={[
        {
          avatarSrc: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
          name: "Elena Rodriguez",
          handle: "@elena_insurance",
          text: "La gestión de pólizas y siniestros nunca había sido tan fluida. ¡Excelente herramienta!"
        },
        {
          avatarSrc: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
          name: "Carlos Mendoza",
          handle: "@carlos_broker",
          text: "Una interfaz limpia y moderna que realmente ayuda a enfocarse en lo importante: el cliente."
        }
      ]}
      onResetPassword={() => alert("Función próximamente. Contacte al soporte técnico.")}
      onCreateAccount={() => alert("Registro de cuentas restringido por seguridad.")}
    />
  )
}
