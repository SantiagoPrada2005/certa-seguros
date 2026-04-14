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
import { Building2, User2, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Client360DialogProps {
  clientId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  availableServices: any[]
}

export function Client360Dialog({ clientId, isOpen, onOpenChange, availableServices }: Client360DialogProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!clientId) return
      setLoading(true)
      const res = await getClientDetails(clientId)
      if (res.success) {
        setData(res.data)
      }
      setLoading(false)
    }

    if (isOpen && clientId) {
      fetchData()
    } else {
      setData(null)
    }
  }, [clientId, isOpen])

  const refreshData = async () => {
    const res = await getClientDetails(clientId)
    if (res.success) {
      setData(res.data)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              <div>
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
      </DialogContent>
    </Dialog>
  )
}
