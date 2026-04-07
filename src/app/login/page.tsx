"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { createSession } from "./actions"
import { SignInPage } from "@/components/ui/sign-in"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("masterKey") as string // MasterKey was the original name, but effectively it's the password now

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      
      const sessionResult = await createSession(token)
      
      if (sessionResult?.error) {
        throw new Error(sessionResult.error)
      }

      toast.success("Inicio de sesión exitoso")
      router.push("/admin")
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
      router.push("/admin")
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
