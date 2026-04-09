"use client"

import { useState, useMemo } from "react"
import { PoliciesToolbar } from "./policies-toolbar"
import { PoliciesTable, PolicyData } from "./policies-table"
import { PolicyDialog } from "./policy-dialog"
import { PolicyStatus, PolicyType } from "@/generated/prisma"
import { deletePolicy, updatePolicyStatus } from "../_actions/policy-actions"
import { toast } from "sonner"

interface PoliciesClientProps {
  initialPolicies: PolicyData[]
  clients: { id: string, name: string, documentNumber: string | null }[]
  services: { id: string, name: string }[]
}

export function PoliciesClient({ initialPolicies, clients, services }: PoliciesClientProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | "ALL">("ALL")
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyData | null>(null)

  // Filtrado local simple (puede cambiarse a SSR si crecen los datos)
  const filteredPolicies = useMemo(() => {
    return initialPolicies.filter((policy) => {
      const matchStatus = statusFilter === "ALL" || policy.status === statusFilter
      const matchSearch = 
        policy.policyNumber.toLowerCase().includes(search.toLowerCase()) || 
        policy.client.name.toLowerCase().includes(search.toLowerCase()) ||
        policy.type.toLowerCase().includes(search.toLowerCase())

      return matchStatus && matchSearch
    })
  }, [initialPolicies, search, statusFilter])

  const handleEdit = (policy: PolicyData) => {
    setSelectedPolicy(policy)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedPolicy(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta póliza permanentemente?")) {
      const res = await deletePolicy(id)
      if (res.success) {
        toast.success("Póliza eliminada exitosamente")
      } else {
        toast.error(res.error || "No se pudo eliminar la póliza")
      }
    }
  }

  const handleChangeStatus = async (id: string, status: PolicyStatus) => {
    const res = await updatePolicyStatus(id, status)
    if (res.success) {
      toast.success("Estado de la póliza actualizado")
    } else {
      toast.error(res.error || "No se pudo actualizar el estado")
    }
  }

  return (
    <div className="space-y-6">
      <PoliciesToolbar 
        onSearch={setSearch} 
        onStatusFilter={setStatusFilter} 
        currentStatus={statusFilter} 
        onNewPolicy={handleNew}
      />
      
      <PoliciesTable 
        policies={filteredPolicies} 
        onEdit={handleEdit} 
        onChangeStatus={handleChangeStatus} 
        onDelete={handleDelete} 
      />

      <PolicyDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        policy={selectedPolicy}
        clients={clients}
        services={services}
      />
    </div>
  )
}
