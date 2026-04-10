import { useState } from "react"
import { PolicyStatus } from "@/generated/prisma"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, CalendarDays, AlertTriangle, XCircle, FileClock, FileText, Plus, ChevronDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PolicyDialog } from "@/app/admin/(dashboard)/polizas/_components/policy-dialog"
import { updatePolicyStatus } from "@/app/admin/(dashboard)/polizas/_actions/policy-actions"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PoliciesTab({ client, availableServices, onUpdate }: { client: any; availableServices: any[]; onUpdate: () => void }) {
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null)
  
  const policies = client?.policies || []

  const getStatusInfo = (status: PolicyStatus) => {
    switch (status) {
      case "ACTIVE": return { 
        label: "Activa", 
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30",
        icon: ShieldCheck 
      }
      case "PENDING_RENEWAL": return { 
        label: "Por Renovar", 
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/30",
        icon: FileClock 
      }
      case "EXPIRED": return { 
        label: "Vencida", 
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30",
        icon: AlertTriangle 
      }
      case "CANCELLED": return { 
        label: "Cancelada", 
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700/30",
        icon: XCircle 
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  const handleStatusChange = async (id: string, newStatus: PolicyStatus) => {
    setIsUpdatingId(id)
    try {
      const res = await updatePolicyStatus(id, newStatus)
      if (res.success) {
        toast.success("Estado actualizado")
        onUpdate()
      } else {
        toast.error(res.error || "Error al actualizar estado")
      }
    } catch (e) {
      toast.error("Error al actualizar la póliza")
    } finally {
      setIsUpdatingId(null)
    }
  }

  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-16 text-center">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <FileText className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-card-foreground">No hay pólizas registradas</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-6">
          Este cliente aún no tiene seguros o pólizas activas en el sistema.
        </p>
        <Button onClick={() => setIsPolicyDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Registrar Póliza
        </Button>
        <PolicyDialog 
          open={isPolicyDialogOpen} 
          onOpenChange={(open: boolean) => {
            setIsPolicyDialogOpen(open)
            if (!open) onUpdate()
          }} 
          clients={[{ id: client.id, name: client.name, documentNumber: client.documentNumber }]} 
          services={availableServices} 
          defaultClientId={client.id}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Historial de Pólizas ({policies.length})
        </h3>
        <Button size="sm" onClick={() => setIsPolicyDialogOpen(true)}>
          <Plus className="size-4 mr-1.5" />
          Nueva Póliza
        </Button>
      </div>
      
      <div className="grid gap-3">
        {policies.map((policy: any) => {
          const StatusIcon = getStatusInfo(policy.status).icon
          return (
            <div key={policy.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors gap-4">
              <div className="flex items-start gap-3">
                <div className="hidden sm:flex size-10 items-center justify-center rounded-lg border bg-muted/50 shrink-0">
                  <ShieldCheck className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold text-foreground text-base leading-none">{policy.policyNumber}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold h-5">
                      {policy.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      <span>{formatDate(policy.startDate)} - {formatDate(policy.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-xs text-muted-foreground uppercase font-medium">Prima Total</span>
                  <span className="font-bold text-foreground">{formatCurrency(policy.premiumAmount)}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button className="flex items-center outline-none ring-0 focus:outline-none" disabled={isUpdatingId === policy.id} />
                    }
                  >
                    <Badge variant="outline" className={`gap-1 shadow-none cursor-pointer hover:opacity-80 transition-opacity ${getStatusInfo(policy.status).color}`}>
                      {isUpdatingId === policy.id ? (
                        <RefreshCw className="size-3 animate-spin" />
                      ) : (
                        <StatusIcon className="size-3" />
                      )}
                      {getStatusInfo(policy.status).label}
                      <ChevronDown className="size-3 ml-1 opacity-50" />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(policy.id, "ACTIVE")}>Marcar como Activa</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(policy.id, "PENDING_RENEWAL")}>Marcar como Por Renovar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(policy.id, "EXPIRED")}>Marcar como Vencida</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(policy.id, "CANCELLED")} className="text-destructive">Cancelar Póliza</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>
      
      <PolicyDialog 
        open={isPolicyDialogOpen} 
        onOpenChange={(open: boolean) => {
          setIsPolicyDialogOpen(open)
          if (!open) onUpdate()
        }} 
        clients={[{ id: client.id, name: client.name, documentNumber: client.documentNumber }]} 
        services={availableServices} 
        defaultClientId={client.id}
      />
    </div>
  )
}
