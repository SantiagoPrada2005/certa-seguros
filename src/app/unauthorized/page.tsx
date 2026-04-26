import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <ShieldAlert className="w-16 h-16 mx-auto text-destructive" />
        <h1 className="text-4xl font-bold">Acceso no autorizado</h1>
        <p className="text-muted-foreground">
          No tienes permisos de administrador para acceder a esta sección.
          Si crees que esto es un error, contacta al administrador del sistema.
        </p>
        <Link href="/login">
          <Button>Volver al inicio de sesión</Button>
        </Link>
      </div>
    </div>
  )
}
