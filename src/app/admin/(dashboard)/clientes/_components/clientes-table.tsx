"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ClientStatus, ClientType } from "@/generated/prisma/client"
import { ShieldAlert, CreditCard, Building2, User2, Eye, MoreVertical, Pencil, CalendarPlus, FilePlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ClientData = {
  id: string
  name: string
  type: ClientType
  documentType: string | null
  documentNumber: string | null
  email: string | null
  phone: string | null
  status: ClientStatus
  tags: { id: string; name: string; color: string | null }[]
  _count: { services: number; policies: number }
}

interface ClientesTableProps {
  clients: ClientData[]
  onSelectClient: (id: string) => void
  onEditClient?: (id: string) => void
  onCreatePolicy?: (id: string) => void
  onCreateReminder?: (id: string) => void
}

export function ClientesTable({ clients, onSelectClient, onEditClient, onCreatePolicy, onCreateReminder }: ClientesTableProps) {
  
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case "ACTIVO": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "INACTIVO": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
      case "MOROSO": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: ClientStatus) => {
    switch (status) {
      case "ACTIVO": return "Activo"
      case "INACTIVO": return "Inactivo"
      case "MOROSO": return "Moroso"
      default: return status
    }
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 mt-6 border rounded-xl bg-card text-center border-dashed">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <User2 className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-card-foreground">No se encontraron clientes</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Ajusta los filtros de búsqueda o registra un nuevo prospecto en la base de datos.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Identificación</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Relaciones</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow
              key={client.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors group"
              onClick={() => onSelectClient(client.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectClient(client.id) } }}
              tabIndex={0}
              role="button"
              aria-label={`Ver detalles de ${client.name}`}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex size-9 items-center justify-center rounded-lg border bg-background shrink-0">
                    {client.type === "BUSINESS" ? (
                      <Building2 className="size-4 text-muted-foreground" />
                    ) : (
                      <User2 className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {client.type === "BUSINESS" ? "Empresa" : "Persona Natural"}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {client.documentNumber ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {client.documentType || "DOC"}
                    </Badge>
                    <span className="text-sm font-medium">{client.documentNumber}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Sin registro</span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex flex-col text-sm">
                  {client.email && <span className="truncate max-w-[180px]">{client.email}</span>}
                  {client.phone && <span className="text-muted-foreground">{client.phone}</span>}
                  {!client.email && !client.phone && <span className="text-muted-foreground italic">Sin contacto</span>}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary" className={`border-transparent font-medium shadow-none hover:bg-transparent ${getStatusColor(client.status)}`}>
                  {getStatusLabel(client.status)}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Badge variant="outline" className="bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 gap-1 rounded-sm border-blue-200 dark:border-blue-800" aria-label={`${client._count.services} servicios de interés`}>
                    <ShieldAlert className="size-3" />
                    {client._count.services}
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 gap-1 rounded-sm border-emerald-200 dark:border-emerald-800" aria-label={`${client._count.policies} pólizas`}>
                    <CreditCard className="size-3" />
                    {client._count.policies}
                  </Badge>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button
                        className="p-1 rounded hover:bg-muted"
                        aria-label={`Acciones rápidas para ${client.name}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => onSelectClient(client.id)}>
                        <Eye className="size-4 mr-2" />
                        Ver 360°
                      </DropdownMenuItem>
                      {onEditClient && (
                        <DropdownMenuItem onClick={() => onEditClient(client.id)}>
                          <Pencil className="size-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onCreatePolicy && (
                        <DropdownMenuItem onClick={() => onCreatePolicy(client.id)}>
                          <FilePlus className="size-4 mr-2" />
                          Crear Póliza
                        </DropdownMenuItem>
                      )}
                      {onCreateReminder && (
                        <DropdownMenuItem onClick={() => onCreateReminder(client.id)}>
                          <CalendarPlus className="size-4 mr-2" />
                          Crear Recordatorio
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
