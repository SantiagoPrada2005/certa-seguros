"use client"

import { Search, Plus, Filter, Target } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PolicyStatus } from "@/generated/prisma/client"

interface PoliciesToolbarProps {
  onSearch: (value: string) => void
  onStatusFilter: (status: PolicyStatus | "ALL") => void
  onNewPolicy: () => void
  currentStatus: PolicyStatus | "ALL"
}

export function PoliciesToolbar({ 
  onSearch, 
  onStatusFilter, 
  onNewPolicy, 
  currentStatus 
}: PoliciesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por póliza o cliente..."
          className="pl-9 bg-background"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex w-full sm:w-auto items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="w-full sm:w-auto bg-background gap-2">
                <Filter className="size-4" />
                Estado: {
                  currentStatus === "ALL" ? "Todos" : 
                  currentStatus === "ACTIVE" ? "Activas" :
                  currentStatus === "EXPIRED" ? "Vencidas" : 
                  currentStatus === "CANCELLED" ? "Canceladas" : 
                  "Pend. Renovar"
                }
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={currentStatus} onValueChange={(v) => onStatusFilter(v as PolicyStatus | "ALL")}>
              <DropdownMenuRadioItem value="ALL">Todos los estados</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ACTIVE">Activas</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="PENDING_RENEWAL">Pendientes de Renovación</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="EXPIRED">Vencidas</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="CANCELLED">Canceladas</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={onNewPolicy} className="w-full sm:w-auto gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nueva Póliza</span>
          <span className="sm:hidden">Póliza</span>
        </Button>
      </div>
    </div>
  )
}
