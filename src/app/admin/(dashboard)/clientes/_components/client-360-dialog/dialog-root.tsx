"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getClientDetails } from "../../actions"
import { OverviewTab } from "./tabs/overview-tab"
import { ServicesTab } from "./tabs/services-tab"
import { PoliciesTab } from "./tabs/policies-tab"
import { InvoicesTab } from "./tabs/invoices-tab"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, User2, Tag, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EditClientDialog } from "../edit-client-dialog"
import { ClientType, ClientStatus, DocumentType } from "@/generated/prisma/client"

interface ClientDetails {
  id: string
  name: string
  type: ClientType
  documentType: DocumentType | null
  documentNumber: string | null
  email: string | null
  phone: string | null
  address: string | null
  birthDate: Date | null
  city: string | null
  notes: string | null
  status: ClientStatus
  tags: Array<{ id: string; name: string; color: string | null }>
  services: Array<{
    id: string
    assignedAt: Date
    service: {
      id: string
      name: string
      price: number | null
      subcategory: { name: string; category: { name: string } }
    }
  }>
  policies: Array<{
    id: string
    policyNumber: string
    type: string
    premiumAmount: number
    commissionAmount: number
    startDate: Date
    endDate: Date
    status: string
  }>
  invoices: Array<{
    id: string
    number: string
    date: Date
    dueDate: Date
    subtotal: number
    discountAmount: number
    taxRate: number
    taxAmount: number
    total: number
    status: string
  }>
}

interface AvailableService {
  id: string
  name: string
  price: number | null
  description: string | null
  subcategory: { name: string; category: { name: string } } | null
}

interface Client360DialogProps {
  clientId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  availableServices: AvailableService[]
}

export function Client360Dialog({ clientId, isOpen, onOpenChange, availableServices }: Client360DialogProps) {
  const [data, setData] = useState<ClientDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      if (!isOpen || !clientId) {
        return
      }
      setLoading(true)
      const res = await getClientDetails(clientId)
      if (!cancelled && res.success) {
        setData(res.data as ClientDetails)
      }
      if (!cancelled) {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [clientId, isOpen])

  function handleOpenChange(open: boolean) {
    if (!open) {
      setData(null)
    }
    onOpenChange(open)
  }

  const refreshData = async () => {
    const res = await getClientDetails(clientId)
    if (res.success) {
      setData(res.data as ClientDetails)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <div className="px-6 py-6 border-b shrink-0 bg-muted/20">
          <DialogHeader className="text-left space-y-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="size-10 rounded-full border bg-background flex items-center justify-center shrink-0 shadow-sm">
                {data?.type === "BUSINESS" ? (
                  <Building2 className="size-5 text-muted-foreground" />
                ) : (
                  <User2 className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl leading-none" render={<div />}>
                  {loading ? <Skeleton className="h-6 w-48" /> : data?.name}
                </DialogTitle>
                <DialogDescription className="mt-1" render={<div />}>
                  {loading ? (
                    <Skeleton className="h-4 w-32 mt-2" />
                  ) : (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span>
                        {data?.documentType || "Doc"}: {data?.documentNumber || "No registrado"}
                        {" • "}
                        {data?.type === "BUSINESS" ? "Empresa" : "Natural"}
                      </span>
                      {data?.tags && data.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {data.tags.map((tag: { id: string; name: string; color: string | null }) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="gap-0.5 text-[10px]"
                              style={tag.color ? {
                                borderColor: tag.color,
                                color: tag.color,
                              } : undefined}
                            >
                              <Tag className="size-2.5" />
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </DialogDescription>
              </div>
              {!loading && data && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditDialogOpen(true)}
                  aria-label="Editar cliente"
                >
                  <Pencil className="size-4" />
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : !data ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Error al cargar los datos del cliente.
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="policies">Pólizas</TabsTrigger>
                <TabsTrigger value="invoices">Facturación</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0 outline-none">
                <OverviewTab client={data} />
              </TabsContent>
              
              <TabsContent value="services" className="mt-0 outline-none">
                <ServicesTab 
                  client={data} 
                  availableServices={availableServices} 
                  onUpdate={refreshData}
                />
              </TabsContent>
              
              <TabsContent value="policies" className="mt-0 outline-none">
                <PoliciesTab client={data} availableServices={availableServices} onUpdate={refreshData} />
              </TabsContent>
              
              <TabsContent value="invoices" className="mt-0 outline-none">
                <InvoicesTab client={data} onUpdate={refreshData} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Edit Client Dialog */}
        <EditClientDialog
          client={data ? {
            id: data.id,
            name: data.name,
            type: data.type,
            documentType: data.documentType,
            documentNumber: data.documentNumber,
            email: data.email,
            phone: data.phone,
            address: data.address,
            birthDate: data.birthDate,
            city: data.city,
            notes: data.notes,
            status: data.status,
            tags: data.tags || [],
          } : null}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      </DialogContent>
    </Dialog>
  )
}
