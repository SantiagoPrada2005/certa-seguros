"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignServiceToClient, removeServiceFromClient } from "../../../actions"
import { Trash2, PlusCircle, BookmarkCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ServicesTab({ client, availableServices, onUpdate }: { client: any, availableServices: any[], onUpdate: () => void }) {
  const [selectedService, setSelectedService] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const unassignedServices = availableServices.filter(
    (service) => !client.services?.some((cs: any) => cs.serviceId === service.id)
  )

  const handleAssignService = async () => {
    if (!selectedService) return
    setIsAssigning(true)
    
    const res = await assignServiceToClient({
      clientId: client.id,
      serviceId: selectedService
    })

    if (res.success) {
      toast.success("Servicio asignado correctamente")
      setSelectedService("")
      onUpdate()
    } else {
      toast.error(res.error || "Error al asignar servicio")
    }
    
    setIsAssigning(false)
  }

  const handleRemoveService = async (clientServiceId: string) => {
    setRemovingId(clientServiceId)
    
    const res = await removeServiceFromClient({ clientServiceId })
    
    if (res.success) {
      toast.success("Servicio desvinculado")
      onUpdate()
    } else {
      toast.error(res.error || "Error al desvincular servicio")
    }
    
    setRemovingId(null)
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Asignar Nuevo Servicio
            <Badge variant="outline" className="bg-primary/5 text-primary">Operación Rápida</Badge>
          </CardTitle>
          <CardDescription>
            Agrega un servicio de interés al perfil del cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedService} onValueChange={(v) => setSelectedService(v || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un servicio del catálogo" />
              </SelectTrigger>
              <SelectContent>
                {unassignedServices.length === 0 ? (
                  <SelectItem value="none" disabled>No hay más servicios disponibles</SelectItem>
                ) : (
                  unassignedServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.subcategory?.name || "General"} - {service.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAssignService} 
              disabled={!selectedService || selectedService === "none" || isAssigning}
              className="shrink-0"
            >
              {isAssigning ? <Loader2 className="size-4 animate-spin mr-2" /> : <PlusCircle className="size-4 mr-2" />}
              Asignar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <BookmarkCheck className="size-4 text-emerald-500" /> 
          Servicios Vinculados ({client.services?.length || 0})
        </h3>
        
        {(!client.services || client.services.length === 0) ? (
          <div className="text-sm text-muted-foreground p-8 text-center border border-dashed rounded-lg bg-muted/10">
            Este cliente no tiene servicios asignados o áreas de interés registradas.
          </div>
        ) : (
          <div className="grid gap-3">
            {client.services.map((item: any) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card transition-colors hover:bg-muted/30"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-normal">
                      {item.service.subcategory?.category?.name || "General"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.service.subcategory?.name || ""}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-foreground">{item.service.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-h-8 truncate">
                    {item.service.description || "Sin descripción"}
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveService(item.id)}
                  disabled={removingId === item.id}
                >
                  {removingId === item.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
