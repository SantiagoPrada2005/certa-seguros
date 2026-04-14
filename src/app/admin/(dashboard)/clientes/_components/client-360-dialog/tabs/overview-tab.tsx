"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, CalendarClock, Hash, CalendarDays, FileText, Tag } from "lucide-react"

export function OverviewTab({ client }: { client: any }) {

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
    }).format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
      case "INACTIVO": return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
      case "MOROSO": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      default: return ""
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVO": return "Activo"
      case "INACTIVO": return "Inactivo"
      case "MOROSO": return "Moroso"
      default: return status
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3 bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <InfoItem icon={<Mail />} label="Email" value={client.email} />
          <InfoItem icon={<Phone />} label="Teléfono" value={client.phone} />
          <InfoItem icon={<MapPin />} label="Dirección" value={client.address} />
          <InfoItem icon={<MapPin />} label="Ciudad" value={client.city} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Hash className="size-4 text-muted-foreground" />
            Detalles Personales
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <InfoItem
            icon={<CalendarDays />}
            label="Fecha de Nacimiento"
            value={client.birthDate ? formatDate(client.birthDate) : null}
          />
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground w-28">Estado:</span>
            <Badge variant="outline" className={getStatusColor(client.status)}>
              {getStatusLabel(client.status)}
            </Badge>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground w-28">Origen:</span>
            <Badge variant="secondary" className="font-normal">{client.source || "No definido"}</Badge>
          </div>
          <InfoItem
            icon={<CalendarClock />}
            label="Registrado"
            value={formatDate(client.createdAt)}
          />
        </CardContent>
      </Card>

      {client.tags && client.tags.length > 0 && (
        <Card className="col-span-full">
          <CardHeader className="pb-3 border-b border-dashed">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {client.tags.map((tag: { id: string; name: string; color: string | null }) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="gap-1"
                  style={tag.color ? {
                    borderColor: tag.color,
                    color: tag.color,
                  } : undefined}
                >
                  <Tag className="size-3" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {client.notes && (
        <Card className="col-span-full">
          <CardHeader className="pb-3 border-b border-dashed">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card className="col-span-full">
        <CardHeader className="pb-3 border-b border-dashed">
          <CardTitle className="text-sm font-medium">Resumen Actividad</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
              <span className="text-2xl font-semibold text-foreground">{client.services?.length || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Servicios</span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
              <span className="text-2xl font-semibold text-foreground">{client.policies?.length || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pólizas</span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
              <span className="text-2xl font-semibold text-foreground">{client.invoices?.length || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Facturas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-4 shrink-0 mt-0.5 text-muted-foreground [&>*]:size-full">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none text-foreground">{value || "No registrado"}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
