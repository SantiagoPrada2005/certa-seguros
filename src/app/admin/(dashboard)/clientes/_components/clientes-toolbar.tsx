"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { CreateClientDialog } from "./create-client-dialog"

interface ClientesToolbarProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  selectedStatus: string
  setSelectedStatus: (val: any) => void
}

export function ClientesToolbar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus
}: ClientesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Buscar clientes por nombre, doc o email..." 
          className="pl-9 bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Estado del cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="NUEVO">Nuevos</SelectItem>
            <SelectItem value="CONTACTADO">Contactados</SelectItem>
            <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
            <SelectItem value="ACTIVO">Activos (Clientes)</SelectItem>
            <SelectItem value="INACTIVO">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <CreateClientDialog />
      </div>
    </div>
  )
}
