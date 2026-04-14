"use client"

import { useState } from "react"
import { ClientStatus, ClientType } from "@/generated/prisma/client"
import { ClientesToolbar } from "./_components/clientes-toolbar"
import { ClientesTable } from "./_components/clientes-table"
import { Client360Dialog } from "./_components/client-360-dialog/dialog-root"

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

interface ClientesClientProps {
  initialClients: ClientData[]
  availableServices: any[]
}

export function ClientesClient({ initialClients, availableServices }: ClientesClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus | "ALL">("ALL")
  
  // Sheet Management
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  
  // Filtrado
  const filteredClients = initialClients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          client.documentNumber?.includes(searchQuery) ||
                          client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "ALL" || client.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <ClientesToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />
      
      <ClientesTable 
        clients={filteredClients} 
        onSelectClient={setSelectedClientId} 
      />
      
      {selectedClientId && (
        <Client360Dialog 
          clientId={selectedClientId}
          isOpen={!!selectedClientId}
          onOpenChange={(open) => {
            if (!open) setSelectedClientId(null)
          }}
          availableServices={availableServices}
        />
      )}
    </div>
  )
}
