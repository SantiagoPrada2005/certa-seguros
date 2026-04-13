"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, FileIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import { PolicyType, PolicyStatus } from "@/generated/prisma"
import { policySchema, PolicyFormValues } from "../_schemas/policy.schema"
import { createPolicy, updatePolicy } from "../_actions/policy-actions"
import { toast } from "sonner"
import { PolicyData } from "./policies-table"

interface PolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy?: PolicyData | null
  clients: { id: string, name: string, documentNumber: string | null }[]
  services: { id: string, name: string }[]
  defaultClientId?: string
}

export function PolicyDialog({ open, onOpenChange, policy, clients, services, defaultClientId }: PolicyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useAutoCalculate, setUseAutoCalculate] = useState(false)
  const [commissionPercentage, setCommissionPercentage] = useState<string>("")
  const isEditing = !!policy

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      type: policy?.type || "SOAT",
      status: policy?.status || "ACTIVE",
      policyNumber: policy?.policyNumber || "",
      premiumAmount: policy ? Number(policy.premiumAmount) : 0,
      commissionAmount: policy ? Number(policy.commissionAmount) : 0,
      clientId: policy?.client.id || defaultClientId || "",
      serviceId: policy?.service?.id || "",
      startDate: policy ? new Date(policy.startDate) : new Date(),
      endDate: policy ? new Date(policy.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  })

  // Reset form values when dialog opens or policy changes
  useEffect(() => {
    if (open) {
      form.reset({
        type: policy?.type || "SOAT",
        status: policy?.status || "ACTIVE",
        policyNumber: policy?.policyNumber || "",
        premiumAmount: policy ? Number(policy.premiumAmount) : 0,
        commissionAmount: policy ? Number(policy.commissionAmount) : 0,
        clientId: policy?.client.id || defaultClientId || "",
        serviceId: policy?.service?.id || "",
        startDate: policy ? new Date(policy.startDate) : new Date(),
        endDate: policy ? new Date(policy.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      })
    }
  }, [open, policy?.id, form, policy, defaultClientId])

  // Auto-calculate commission based on premium and percentage
  const premiumAmount = form.watch("premiumAmount")
  useEffect(() => {
    if (useAutoCalculate && premiumAmount !== undefined && commissionPercentage !== "") {
      const percentage = Number(commissionPercentage)
      const calculated = Math.round(Number(premiumAmount) * (percentage / 100))
      form.setValue("commissionAmount", calculated, { shouldValidate: true })
    }
  }, [useAutoCalculate, commissionPercentage, premiumAmount, form])

  async function onSubmit(data: PolicyFormValues) {
    setIsSubmitting(true)
    try {
      if (isEditing && policy) {
        const result = await updatePolicy(policy.id, data)
        if (!result.success) throw new Error(result.error)
        toast.success("Póliza actualizada exitosamente")
      } else {
        const result = await createPolicy(data)
        if (!result.success) throw new Error(result.error)
        toast.success("Póliza creada exitosamente")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileIcon className="size-5" />
            </div>
            <div>
              <DialogTitle>{isEditing ? "Editar Póliza" : "Registrar Nueva Póliza"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Modifica los detalles financieros y de vigencia de la póliza." 
                  : "Ingresa los datos para registrar un producto de seguro activo."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.policyNumber}>
              <FieldLabel htmlFor="policyNumber">Número de Póliza *</FieldLabel>
              <Input 
                id="policyNumber" 
                placeholder="Ej. POL-2023-XYZ" 
                {...form.register("policyNumber")}
                aria-invalid={!!form.formState.errors.policyNumber}
              />
              {form.formState.errors.policyNumber && (
                <FieldDescription className="text-destructive">
                  {form.formState.errors.policyNumber.message}
                </FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!form.formState.errors.type}>
              <FieldLabel htmlFor="type">Tipo de Seguro *</FieldLabel>
              <Select 
                value={form.watch("type") ?? ""} 
                onValueChange={(val) => form.setValue("type", val as PolicyType)}
              >
                <SelectTrigger id="type" aria-invalid={!!form.formState.errors.type}>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PolicyType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field data-invalid={!!form.formState.errors.clientId}>
              <FieldLabel htmlFor="clientId">Cliente *</FieldLabel>
              <Select
                value={form.watch("clientId") ?? ""}
                onValueChange={(val) => form.setValue("clientId", val || "")}
              >
                <SelectTrigger id="clientId" aria-invalid={!!form.formState.errors.clientId}>
                  <SelectValue placeholder="Buscar cliente...">
                    {form.watch("clientId") && (() => {
                      const client = clients.find(c => c.id === form.watch("clientId"));
                      return client ? <span>{client.name}{client.documentNumber ? ` (${client.documentNumber})` : ""}</span> : null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.documentNumber ? `(${client.documentNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field data-invalid={!!form.formState.errors.serviceId}>
              <FieldLabel htmlFor="serviceId">Servicio Relacionado (Opcional)</FieldLabel>
              <Select
                value={form.watch("serviceId") ?? "none"}
                onValueChange={(val) => form.setValue("serviceId", val === "none" ? undefined : val)}
              >
                <SelectTrigger id="serviceId">
                  <SelectValue placeholder="Asignar a un servicio">
                    {form.watch("serviceId") && (() => {
                      if (form.watch("serviceId") === "none") return null;
                      const service = services.find(s => s.id === form.watch("serviceId"));
                      return service ? <span>{service.name}</span> : null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No asignar servicio principal</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-dashed border-border/60">
            <Field data-invalid={!!form.formState.errors.premiumAmount}>
              <FieldLabel htmlFor="premiumAmount">Prima Total (COP) *</FieldLabel>
              <Input
                id="premiumAmount"
                type="number"
                placeholder="0"
                {...form.register("premiumAmount")}
                aria-invalid={!!form.formState.errors.premiumAmount}
              />
            </Field>

            <div className="flex flex-col gap-2">
              <Field data-invalid={!!form.formState.errors.commissionAmount}>
                <FieldLabel htmlFor="commissionAmount">
                  <div className="flex items-center justify-between">
                    <span>Comisión (COP) *</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="auto-calculate"
                        checked={useAutoCalculate}
                        onCheckedChange={setUseAutoCalculate}
                      />
                      <label htmlFor="auto-calculate" className="text-xs text-muted-foreground cursor-pointer">
                        Auto {useAutoCalculate && commissionPercentage && `(${commissionPercentage}%)`}
                      </label>
                    </div>
                  </div>
                </FieldLabel>
                {useAutoCalculate ? (
                  <div className="flex gap-2">
                    <Input
                      id="commissionAmount"
                      type="number"
                      placeholder="0"
                      value={form.watch("commissionAmount")}
                      disabled
                      aria-invalid={!!form.formState.errors.commissionAmount}
                      className="flex-1 bg-muted/50"
                    />
                  </div>
                ) : (
                  <Input
                    id="commissionAmount"
                    type="number"
                    placeholder="0"
                    {...form.register("commissionAmount")}
                    aria-invalid={!!form.formState.errors.commissionAmount}
                  />
                )}
              </Field>

              {useAutoCalculate && (
                <div className="flex items-center gap-2">
                  <Input
                    id="commissionPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Ej. 15"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground font-medium">%</span>
                  <span className="text-xs text-muted-foreground flex-1 text-right">
                    de la prima
                  </span>
                </div>
              )}
            </div>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.startDate}>
              <FieldLabel>Fecha de Inicio *</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && form.setValue("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field data-invalid={!!form.formState.errors.endDate}>
              <FieldLabel>Fecha de Fin / Vencimiento *</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && form.setValue("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.endDate && (
                <FieldDescription className="text-destructive">
                  {form.formState.errors.endDate.message}
                </FieldDescription>
              )}
            </Field>

             <Field data-invalid={!!form.formState.errors.status} className="md:col-span-2">
              <FieldLabel htmlFor="status">Estado Inicial</FieldLabel>
              <Select 
                value={form.watch("status") ?? ""} 
                onValueChange={(val) => form.setValue("status", val as PolicyStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activa</SelectItem>
                  <SelectItem value="PENDING_RENEWAL">Pendiente de Renovación</SelectItem>
                  <SelectItem value="EXPIRED">Vencida</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t font-semibold">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Póliza"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
