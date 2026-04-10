import { useState } from "react"
import { InvoiceStatus } from "@/generated/prisma"
import { Badge } from "@/components/ui/badge"
import { Receipt, CalendarDays, CheckCircle2, Clock, AlertCircle, FileEdit, Plus, ChevronDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrearFacturaDialog } from "@/components/admin/facturas/crear-factura-dialog"
import { updateInvoiceStatus } from "@/app/admin/actions"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function InvoicesTab({ client, onUpdate }: { client: any; onUpdate: () => void }) {
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null)
  
  const invoices = client?.invoices || []

  const getStatusInfo = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID": return {
        label: "Pagada",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: CheckCircle2 
      }
      case "PENDING": return {
        label: "Pendiente",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: Clock 
      }
      case "OVERDUE": return {
        label: "Vencida",
        color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: AlertCircle 
      }
      case "DRAFT": return {
        label: "Borrador",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
        icon: FileEdit 
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

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    setIsUpdatingId(id)
    try {
      const res = await updateInvoiceStatus(id, newStatus)
      if (res.success) {
        toast.success("Estado de factura actualizado")
        onUpdate()
      } else {
        toast.error(res.error || "Error al actualizar estado")
      }
    } catch (e) {
      toast.error("Error al actualizar la factura")
    } finally {
      setIsUpdatingId(null)
    }
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-16 text-center">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Receipt className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-card-foreground">No hay facturas registradas</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-6">
          Aún no se han emitido cobros o facturas asociadas a este cliente.
        </p>
        <CrearFacturaDialog 
          defaultClientId={client.id}
          onOpenChange={(open) => {
            if (!open) onUpdate()
          }}
          trigger={
            <Button>
              <Plus className="size-4 mr-2" />
              Emitir Factura
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Historial de Facturación ({invoices.length})
        </h3>
        <CrearFacturaDialog 
          defaultClientId={client.id}
          onOpenChange={(open) => {
            if (!open) onUpdate()
          }}
          trigger={
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              Nueva Factura
            </Button>
          }
        />
      </div>
      
      <div className="grid gap-3">
        {invoices.map((invoice: any) => {
          const StatusIcon = getStatusInfo(invoice.status).icon
          return (
            <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors gap-4">
              <div className="flex items-start gap-3">
                <div className="hidden sm:flex size-10 items-center justify-center rounded-lg border bg-muted/50 shrink-0">
                  <Receipt className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold text-foreground text-base leading-none">{invoice.number}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button className="flex items-center outline-none ring-0 focus:outline-none" disabled={isUpdatingId === invoice.id} />
                        }
                      >
                        <Badge variant="outline" className={`gap-1 shadow-none text-[10px] h-5 py-0 cursor-pointer hover:opacity-80 transition-opacity ${getStatusInfo(invoice.status).color}`}>
                          {isUpdatingId === invoice.id ? (
                            <RefreshCw className="size-3 animate-spin" />
                          ) : (
                            <StatusIcon className="size-3" />
                          )}
                          {getStatusInfo(invoice.status).label}
                          <ChevronDown className="size-3 ml-1 opacity-50" />
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "PAID")} className="text-emerald-600 dark:text-emerald-400">Marcar como Pagada</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "PENDING")}>Marcar como Pendiente</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "OVERDUE")} className="text-red-600 dark:text-red-400">Marcar como Vencida</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "DRAFT")}>Cambiar a Borrador</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">Emitida:</span>
                      <span className="font-medium text-foreground">{formatDate(invoice.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">Vence:</span>
                      <span className="font-medium text-foreground">{formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-xs text-muted-foreground uppercase font-medium">Total Facturado</span>
                  <span className="font-bold text-foreground text-lg">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
