"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  User2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  FileText,
  Bell,
  Activity,
  UserPlus,
  MessageSquare,
} from "lucide-react"
import { convertProspectToClient } from "@/app/admin/(dashboard)/prospectos/_actions/prospect-actions"
import { toast } from "sonner"

interface Prospect360DialogProps {
  prospect: {
    id: string
    name: string
    type: string
    documentType: string | null
    documentNumber: string | null
    email: string | null
    phone: string | null
    address: string | null
    status: string
    source: string | null
    createdAt: string
    services: { service: { name: string } }[]
  } | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConverted?: () => void
}

const statusLabels: Record<string, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  EN_PROCESO: "En Proceso",
  DESCARTADO: "Descartado",
  CONVERTIDO: "Convertido",
}

const statusColors: Record<string, string> = {
  NUEVO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CONTACTADO: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  EN_PROCESO: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  DESCARTADO: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  CONVERTIDO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
}

const sourceLabels: Record<string, string> = {
  WEB_PUBLICA: "Web Pública",
  REFERIDOS: "Referidos",
  REDES_SOCIALES: "Redes Sociales",
  DIRECTOS: "Directos",
}

export function Prospect360Dialog({ prospect, isOpen, onOpenChange, onConverted }: Prospect360DialogProps) {
  const [converting, setConverting] = useState(false)
  const [showConvertForm, setShowConvertForm] = useState(false)
  const [convertData, setConvertData] = useState({
    birthDate: "",
    city: "",
    notes: "",
  })

  if (!prospect) return null

  const handleConvert = async () => {
    setConverting(true)
    const result = await convertProspectToClient({
      prospectId: prospect.id,
      birthDate: convertData.birthDate || null,
      city: convertData.city || null,
      notes: convertData.notes || null,
    })

    setConverting(false)

    if (result.success) {
      toast.success(`${prospect.name} convertido a cliente exitosamente`)
      onOpenChange(false)
      onConverted?.()
    } else {
      toast.error(result.error || "Error al convertir el prospecto")
    }
  }

  const handleWhatsApp = () => {
    if (prospect.phone) {
      const phone = prospect.phone.replace(/\D/g, "")
      const message = encodeURIComponent(`Hola ${prospect.name}, te contactamos de Certa Seguros`)
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-3xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <div className="px-6 py-6 border-b shrink-0 bg-muted/20">
          <DialogHeader className="text-left space-y-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="size-10 rounded-full border bg-background flex items-center justify-center shrink-0 shadow-sm">
                {prospect.type === "BUSINESS" ? (
                  <Building2 className="size-5 text-muted-foreground" />
                ) : (
                  <User2 className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl leading-none">{prospect.name}</DialogTitle>
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-sm text-muted-foreground">
                    {prospect.documentType ? `${prospect.documentType}: ${prospect.documentNumber || "No registrado"}` : "Sin documento"}
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={statusColors[prospect.status] || ""}>
                      {statusLabels[prospect.status] || prospect.status}
                    </Badge>
                    {prospect.source && (
                      <Badge variant="secondary">{sourceLabels[prospect.source] || prospect.source}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {prospect.phone && (
                <Button size="sm" variant="outline" onClick={handleWhatsApp} className="gap-2">
                  <MessageSquare className="size-4" />
                  WhatsApp
                </Button>
              )}
              {prospect.status !== "DESCARTADO" && prospect.status !== "CONVERTIDO" && (
                <Button size="sm" onClick={() => setShowConvertForm(!showConvertForm)} className="gap-2">
                  <UserPlus className="size-4" />
                  Convertir a Cliente
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showConvertForm ? (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Convertir a Cliente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Completa la información adicional para convertir este prospecto en un cliente activo.
                </p>
              </div>

              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="birthDate">Fecha de Nacimiento</FieldLabel>
                  <Input
                    id="birthDate"
                    type="date"
                    value={convertData.birthDate}
                    onChange={(e) => setConvertData({ ...convertData, birthDate: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                  <Input
                    id="city"
                    placeholder="Ej. Bogotá"
                    value={convertData.city}
                    onChange={(e) => setConvertData({ ...convertData, city: e.target.value })}
                  />
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="notes">Notas</FieldLabel>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional sobre el cliente..."
                    value={convertData.notes}
                    onChange={(e) => setConvertData({ ...convertData, notes: e.target.value })}
                    className="min-h-[100px]"
                  />
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowConvertForm(false)} disabled={converting}>
                  Cancelar
                </Button>
                <Button onClick={handleConvert} disabled={converting}>
                  {converting ? "Convirtiendo..." : "Confirmar Conversión"}
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="px-6 py-4 border-b shrink-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Información</TabsTrigger>
                  <TabsTrigger value="services">Servicios</TabsTrigger>
                  <TabsTrigger value="activity">Actividad</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <User2 className="size-4" />
                      Información de Contacto
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {prospect.email && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                          <Mail className="size-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{prospect.email}</p>
                          </div>
                        </div>
                      )}
                      {prospect.phone && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                          <Phone className="size-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="text-sm font-medium">{prospect.phone}</p>
                          </div>
                        </div>
                      )}
                      {prospect.address && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card sm:col-span-2">
                          <MapPin className="size-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Dirección</p>
                            <p className="text-sm font-medium">{prospect.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Activity className="size-4" />
                      Detalles del Prospecto
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground">Fuente</p>
                        <p className="text-sm font-medium">
                          {prospect.source ? sourceLabels[prospect.source] : "No especificada"}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground">Fecha de Creación</p>
                        <p className="text-sm font-medium">
                          {new Date(prospect.createdAt).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <p className="text-sm font-medium">
                          {prospect.type === "BUSINESS" ? "Empresa" : "Persona Natural"}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground">Estado</p>
                        <Badge variant="outline" className={statusColors[prospect.status] || ""}>
                          {statusLabels[prospect.status] || prospect.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="m-0 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <FileText className="size-4" />
                      Servicios de Interés
                    </h3>
                    {prospect.services.length > 0 ? (
                      <div className="grid gap-3">
                        {prospect.services.map((ps, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="size-4 text-primary" />
                              </div>
                              <span className="font-medium">{ps.service.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <FileText className="size-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Este prospecto no tiene servicios de interés asignados.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Edita el prospecto para agregar servicios.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="m-0 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Bell className="size-4" />
                      Historial de Actividad
                    </h3>
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Bell className="size-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        El historial de actividad estará disponible próximamente.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
