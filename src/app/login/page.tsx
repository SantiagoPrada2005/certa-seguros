"use client"

import { useActionState } from "react"
import { submitMasterKey } from "./actions"
import { SignInPage } from "@/components/ui/sign-in"

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(submitMasterKey, null)

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
      passwordLabel="Clave Maestra"
      emailPlaceholder="ej. admin@certaseguros.com"
      passwordPlaceholder="Ingrese la clave maestra..."
      formAction={formAction}
      isPending={isPending}
      error={state?.error}
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
      onGoogleSignIn={() => alert("Inicio con Google deshabilitado por seguridad.")}
      onResetPassword={() => alert("Por favor, contacte al soporte técnico para restablecer su clave.")}
      onCreateAccount={() => alert("La creación de cuentas nuevas está restringida.")}
    />
  )
}
