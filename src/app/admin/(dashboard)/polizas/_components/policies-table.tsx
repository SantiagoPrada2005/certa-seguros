"use client"
import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PolicyStatus, PolicyType } from "@/generated/prisma"
import { ShieldCheck, MoreHorizontal, FileText, CalendarDays, AlertTriangle, XCircle, FileClock, ReceiptIcon, DollarSign } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CrearFacturaDialog } from "@/components/admin/facturas/crear-factura-dialog"
import { CrearCuentaCobroDialog } from "@/components/admin/cuentas-cobro/crear-cuenta-cobro-dialog"

export type PolicyData = {
  id: string
  policyNumber: string
  type: PolicyType
  premiumAmount: number
  commissionAmount: number
  startDate: Date
  endDate: Date
  status: PolicyStatus
  client: { id: string, name: string, documentNumber: string | null }
  service: { id: string, name: string } | null
}

interface PoliciesTableProps {
  policies: PolicyData[]
  onEdit: (policy: PolicyData) => void
  onChangeStatus: (id: string, status: PolicyStatus) => void
  onDelete: (id: string) => void
}

export function PoliciesTable({ policies, onEdit, onChangeStatus, onDelete }: PoliciesTableProps) {
  const [invoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false)
  const [prDialogOpen, setPrDialogOpen] = React.useState(false)
  const [selectedPolicy, setSelectedPolicy] = React.useState<PolicyData | null>(null)

  const handleCreateInvoice = (policy: PolicyData) => {
    setSelectedPolicy(policy)
    setInvoiceDialogOpen(true)
  }

  const handleCreatePaymentRequest = (policy: PolicyData) => {
    setSelectedPolicy(policy)
    setPrDialogOpen(true)
  }
  
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 mt-6 border rounded-xl bg-card text-center border-dashed">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <FileText className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-card-foreground">No se encontraron pólizas</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Ajusta los filtros de búsqueda o crea una nueva póliza en el sistema.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Póliza</TableHead>
            <TableHead>Cliente & Servicio</TableHead>
            <TableHead>Premium / Com.</TableHead>
            <TableHead>Vigencia</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => {
            const StatusIcon = getStatusInfo(policy.status).icon
            return (
            <TableRow 
              key={policy.id} 
              className="hover:bg-muted/50 transition-colors group"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex size-9 items-center justify-center rounded-lg border bg-background shrink-0">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{policy.policyNumber}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold mt-1">
                      {policy.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{policy.client.name}</span>
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {policy.service ? policy.service.name : "Servicio independiente"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{formatCurrency(policy.premiumAmount)}</span>
                  <span className="text-muted-foreground text-xs">
                    Com: {formatCurrency(policy.commissionAmount)}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  <div className="flex flex-col">
                    <span>{formatDate(policy.startDate)} -</span>
                    <span className="font-medium text-foreground">{formatDate(policy.endDate)}</span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className={`gap-1.5 shadow-none ${getStatusInfo(policy.status).color}`}>
                  <StatusIcon className="size-3" />
                  {getStatusInfo(policy.status).label}
                </Badge>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(policy)}>
                        Editar Póliza
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateInvoice(policy)}>
                        <ReceiptIcon data-icon="inline-start" className="size-4" />
                        Crear Factura
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreatePaymentRequest(policy)}>
                        <DollarSign data-icon="inline-start" className="size-4" />
                        Crear Cuenta de Cobro
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onChangeStatus(policy.id, "PENDING_RENEWAL")}
                        disabled={policy.status === "PENDING_RENEWAL"}
                      >
                        Marcar para Renovación
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onChangeStatus(policy.id, "ACTIVE")}
                        disabled={policy.status === "ACTIVE"}
                      >
                        Activar Póliza
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onChangeStatus(policy.id, "CANCELLED")}
                        disabled={policy.status === "CANCELLED"}
                        className="text-amber-600 dark:text-amber-400"
                      >
                        Cancelar Póliza
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(policy.id)}
                      className="focus:bg-destructive focus:text-destructive-foreground text-destructive"
                    >
                      Eliminar permanentemente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
      
      <CrearFacturaDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        defaultClientName={selectedPolicy?.client.name}
        defaultClientDocument={selectedPolicy?.client.documentNumber || undefined}
        defaultClientId={selectedPolicy?.client.id}
        defaultServiceId={selectedPolicy?.service?.id}
        defaultAmount={selectedPolicy?.premiumAmount}
        defaultCommissionAmount={selectedPolicy?.commissionAmount}
        defaultDescription={selectedPolicy ? `Prima de Póliza #${selectedPolicy.policyNumber}` : undefined}
      />
      <CrearCuentaCobroDialog
        open={prDialogOpen}
        onOpenChange={setPrDialogOpen}
        defaultClientName={selectedPolicy?.client.name}
        defaultClientDocument={selectedPolicy?.client.documentNumber || undefined}
        defaultClientId={selectedPolicy?.client.id}
        defaultServiceId={selectedPolicy?.service?.id}
        defaultAmount={selectedPolicy?.premiumAmount}
        defaultDescription={selectedPolicy ? `Prima de Póliza #${selectedPolicy.policyNumber}` : undefined}
      />
    </div>
  )
}
