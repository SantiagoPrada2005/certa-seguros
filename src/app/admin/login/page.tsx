"use client"

import { ShieldCheckIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitMasterKey } from "./actions"
import { useActionState } from "react"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(submitMasterKey, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form action={formAction}>
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <ShieldCheckIcon className="size-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Certa Seguros</CardTitle>
              <CardDescription>
                Acceso restringido para administración.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterKey">Clave Maestra Alfanumérica</Label>
                <Input 
                  id="masterKey"
                  name="masterKey" 
                  type="password" 
                  placeholder="Escribe la clave aquí..." 
                  required 
                  autoComplete="off"
                />
                {state?.error && (
                  <p className="text-red-500 text-sm mt-1">{state.error}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Validando..." : "Ingresar al CRM"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
