"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquareIcon,
  MoreHorizontalIcon,
  UserCheckIcon,
  UserPlusIcon,
  Loader2Icon,
  BuildingIcon,
  UserIcon,
  ClockIcon,
} from "lucide-react"
import { type ProspectRecord } from "@/lib/api-client"
import { updateProspectStatus, convertProspectToClient } from "@/app/admin/(dashboard)/prospectos/_actions/prospect-actions"
import { EditarProspectoDialog } from "@/components/admin/prospectos/editar-prospecto-dialog"
import { ConvertirClienteDialog } from "@/components/admin/prospectos/convertir-cliente-dialog"
import { toast } from "sonner"

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  NUEVO: { label: "Nuevos", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
  CONTACTADO: { label: "Contactados", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
  EN_PROCESO: { label: "En Proceso", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
  DESCARTADO: { label: "Descartados", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" },
  CONVERTIDO: { label: "Convertidos", color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
}

const badgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NUEVO: "default",
  CONTACTADO: "outline",
  EN_PROCESO: "secondary",
  DESCARTADO: "destructive",
  CONVERTIDO: "default",
}

function getDaysAgo(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

interface ProspectosKanbanProps {
  initialProspects: ProspectRecord[]
}

export function ProspectosKanban({ initialProspects }: ProspectosKanbanProps) {
  const [prospects, setProspects] = React.useState<ProspectRecord[]>(initialProspects)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [editingProspect, setEditingProspect] = React.useState<ProspectRecord | null>(null)
  const [convertingProspect, setConvertingProspect] = React.useState<ProspectRecord | null>(null)

  // Sync state when Server Component re-renders
  React.useEffect(() => {
    setProspects(initialProspects)
  }, [initialProspects])

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id)
    const result = await updateProspectStatus(id, newStatus as any)
    if (result.success) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: newStatus as ProspectRecord["status"], updatedAt: new Date().toISOString() } : p
        )
      )
      toast.success(`Estado actualizado a ${newStatus}`)
    } else {
      toast.error(result.error)
    }
    setActionLoading(null)
  }

  const handleConvert = async (data: {
    prospectId: string
    birthDate?: string | null
    city?: string | null
    notes?: string | null
  }) => {
    setActionLoading(data.prospectId)
    const result = await convertProspectToClient(data)
    if (result.success) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === data.prospectId
            ? { ...p, status: "CONVERTIDO" as const, updatedAt: new Date().toISOString() }
            : p
        )
      )
      toast.success("Prospecto convertido a cliente exitosamente")
      setConvertingProspect(null)
    } else {
      toast.error(result.error)
    }
    setActionLoading(null)
  }

  const columns = (Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
    const columnProspects = prospects.filter((p) => p.status === status)
    return {
      status,
      config: statusConfig[status],
      prospects: columnProspects,
    }
  })

  return (
    <div className="relative">
      {/* Horizontal scrollable Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(({ status, config, prospects: colProspects }) => (
          <div
            key={status}
            className={`flex min-w-[300px] flex-1 flex-col rounded-xl border ${config.bg}`}
          >
            {/* Column Header */}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-sm font-medium ${config.color}`}>
                  {config.label}
                </CardTitle>
                <Badge variant={badgeVariant[status]} className="text-xs">
                  {colProspects.length}
                </Badge>
              </div>
            </CardHeader>

            {/* Cards */}
            <CardContent className="flex flex-1 flex-col gap-3 pt-0">
              {colProspects.map((prospect) => {
                const daysAgo = getDaysAgo(prospect.updatedAt)
                const isStale = daysAgo > 7

                return (
                  <Card
                    key={prospect.id}
                    className="group relative cursor-pointer border-0 shadow-sm transition-all hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      {/* Header: Name + Avatar */}
                      <div className="flex items-start gap-3">
                        <Avatar className="size-9 shrink-0 rounded-lg bg-primary/10 text-primary">
                          <AvatarFallback className="rounded-lg">
                            {prospect.type === "BUSINESS" ? (
                              <BuildingIcon className="size-4" />
                            ) : (
                              <UserIcon className="size-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium">{prospect.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {prospect.documentType
                              ? `${prospect.documentType} ${prospect.documentNumber ?? ""}`
                              : prospect.type === "BUSINESS"
                              ? "Empresa"
                              : "Persona"}
                          </span>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <Button
                            render={<DropdownMenuTrigger />}
                            variant="ghost"
                            size="icon"
                            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={actionLoading === prospect.id}
                          >
                            {actionLoading === prospect.id ? (
                              <Loader2Icon className="size-3.5 animate-spin" />
                            ) : (
                              <MoreHorizontalIcon className="size-3.5" />
                            )}
                          </Button>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setEditingProspect(prospect)}>
                                Editar Información
                              </DropdownMenuItem>
                              {prospect.phone && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    const phone = prospect.phone!.replace(/\D/g, "")
                                    const message = encodeURIComponent(
                                      `Hola ${prospect.name}, te contactamos de Certa Seguros`
                                    )
                                    window.open(
                                      `https://wa.me/${phone}?text=${message}`,
                                      "_blank"
                                    )
                                  }}
                                >
                                  <MessageSquareIcon data-icon="inline-start" className="size-4" />
                                  WhatsApp
                                </DropdownMenuItem>
                              )}

                              {prospect.status !== "DESCARTADO" &&
                                prospect.status !== "CONVERTIDO" && (
                                  <DropdownMenuItem
                                    onClick={() => setConvertingProspect(prospect)}
                                  >
                                    <UserPlusIcon data-icon="inline-start" className="size-4" />
                                    Convertir a Cliente
                                  </DropdownMenuItem>
                                )}

                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <UserCheckIcon data-icon="inline-start" className="size-4" />
                                  Cambiar estado
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {Object.entries(statusConfig).map(([val, cfg]) => (
                                    <DropdownMenuItem
                                      key={val}
                                      onClick={() => handleStatusChange(prospect.id, val)}
                                      disabled={prospect.status === val}
                                    >
                                      {cfg.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Services */}
                      {prospect.services.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {prospect.services.slice(0, 3).map((ps, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 leading-none">
                              {ps.service.name}
                            </Badge>
                          ))}
                          {prospect.services.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 leading-none">
                              +{prospect.services.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Footer: Aging + Quick Actions */}
                      <div className="mt-3 flex items-center justify-between border-t pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ClockIcon className="size-3" />
                          <span>{daysAgo === 0 ? "Hoy" : `Hace ${daysAgo}d`}</span>
                          {isStale && (
                            <span
                              className="size-2 rounded-full bg-amber-500"
                              title="Prospecto estancado (+7 días)"
                            />
                          )}
                        </div>

                        {/* Quick action: Convert for EN_PROCESO */}
                        {prospect.status === "EN_PROCESO" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setConvertingProspect(prospect)}
                          >
                            <UserPlusIcon className="size-3" />
                            Convertir
                          </Button>
                        )}

                        {/* Quick action: WhatsApp */}
                        {prospect.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              const phone = prospect.phone!.replace(/\D/g, "")
                              const message = encodeURIComponent(
                                `Hola ${prospect.name}, te contactamos de Certa Seguros`
                              )
                              window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
                            }}
                          >
                            <MessageSquareIcon className="size-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {colProspects.length === 0 && (
                <div className="flex flex-1 items-center justify-center py-8 text-xs text-muted-foreground">
                  Sin prospectos
                </div>
              )}
            </CardContent>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <EditarProspectoDialog
        prospect={editingProspect}
        onClose={() => setEditingProspect(null)}
        onSuccess={() => {
          setEditingProspect(null)
        }}
      />

      <ConvertirClienteDialog
        prospect={convertingProspect}
        onClose={() => setConvertingProspect(null)}
        onSuccess={handleConvert}
      />
    </div>
  )
}
