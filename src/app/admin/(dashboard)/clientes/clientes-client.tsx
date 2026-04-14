"use client"

import { useState } from "react"
import { ClientStatus, ClientType, DocumentType } from "@/generated/prisma/client"
import { ClientesToolbar } from "./_components/clientes-toolbar"
import { ClientesTable } from "./_components/clientes-table"
import { Client360Dialog } from "./_components/client-360-dialog/dialog-root"
import { EditClientDialog } from "./_components/edit-client-dialog"

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
  availableServices: {
    id: string
    name: string
    price: number | null
    description: string | null
    subcategory: { name: string; category: { name: string } } | null
  }[]
}

export function ClientesClient({ initialClients, availableServices }: ClientesClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus | "ALL">("ALL")

  // Sheet Management
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [editClientId, setEditClientId] = useState<string | null>(null)

  // Find client data for edit dialog
  const editClientData = editClientId
    ? initialClients.find(c => c.id === editClientId) || null
    : null

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
        setSelectedStatus={(val) => setSelectedStatus(val ?? "ALL")}
      />

      <ClientesTable
        clients={filteredClients}
        onSelectClient={setSelectedClientId}
        onEditClient={setEditClientId}
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

      <EditClientDialog
        client={editClientData ? {
          id: editClientData.id,
          name: editClientData.name,
          type: editClientData.type,
          documentType: editClientData.documentType as DocumentType | null,
          documentNumber: editClientData.documentNumber,
          email: editClientData.email,
          phone: editClientData.phone,
          address: null,
          birthDate: null,
          city: null,
          notes: null,
          status: editClientData.status,
          tags: editClientData.tags,
        } : null}
        open={!!editClientId}
        onOpenChange={(open) => { if (!open) setEditClientId(null) }}
      />
    </div>
  )
}
