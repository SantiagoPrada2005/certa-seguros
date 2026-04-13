"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { createClient } from "../actions"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"

export function CreateClientDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [type, setType] = useState<string>("INDIVIDUAL")
  const [documentType, setDocumentType] = useState<string>("CC")
  const [documentNumber, setDocumentNumber] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<string>("NUEVO")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    
    const result = await createClient({
      name,
      type: type as any,
      documentType,
      documentNumber,
      email: email || "",
      phone: phone || "",
      status: status as any
    })
    
    setIsPending(false)
    
    if (result.success) {
      toast.success("Cliente creado exitosamente")
      setOpen(false)
      // reset form
      setName("")
      setType("INDIVIDUAL")
      setDocumentType("CC")
      setDocumentNumber("")
      setEmail("")
      setPhone("")
      setStatus("NUEVO")
    } else {
      toast.error(result.error || "No se pudo crear el cliente")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon data-icon="inline-start" />
            Crear Cliente
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Crea un nuevo prospecto o cliente. Los campos con asterisco son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre / Razón Social *</FieldLabel>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Tipo de Cliente</FieldLabel>
                  <Select value={type} onValueChange={(val) => setType(val || "INDIVIDUAL")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Persona Natural</SelectItem>
                      <SelectItem value="BUSINESS">Empresa (Jurídica)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Estado</FieldLabel>
                  <Select value={status} onValueChange={(val) => setStatus(val || "NUEVO")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUEVO">Nuevo Prospecto</SelectItem>
                      <SelectItem value="CONTACTADO">Contactado</SelectItem>
                      <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                      <SelectItem value="ACTIVO">Cliente Activo</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Tipo de Documento</FieldLabel>
                  <Select value={documentType} onValueChange={(val) => setDocumentType(val || "CC")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula</SelectItem>
                      <SelectItem value="NIT">NIT</SelectItem>
                      <SelectItem value="CE">Cédula Extranjería</SelectItem>
                      <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="docNumber">Número Documento</FieldLabel>
                  <Input id="docNumber" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Teléfono / Celular</FieldLabel>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !name}>Guardar Cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
