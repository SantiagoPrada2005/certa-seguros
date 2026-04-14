"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { updateClient, getAllTags, createTag } from "../actions"
import { toast } from "sonner"
import { X, Tag, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { ClientStatus, ClientType, DocumentType } from "@/generated/prisma/client"

interface ClientData {
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
}

interface EditClientDialogProps {
  client: ClientData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
  const [isPending, setIsPending] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [type, setType] = useState<string>("INDIVIDUAL")
  const [documentType, setDocumentType] = useState<string>("CC")
  const [documentNumber, setDocumentNumber] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined)
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  // Tags state
  const [tags, setTags] = useState<{ id: string; name: string; color: string | null }[]>([])

  // Reset form when client changes
  const resetForm = useCallback(() => {
    if (client) {
      setName(client.name)
      setType(client.type)
      setDocumentType(client.documentType || "CC")
      setDocumentNumber(client.documentNumber || "")
      setEmail(client.email || "")
      setPhone(client.phone || "")
      setBirthDate(client.birthDate || undefined)
      setCity(client.city || "")
      setAddress(client.address || "")
      setNotes(client.notes || "")
      setSelectedTagIds(client.tags.map(t => t.id))
    }
  }, [client])

  useEffect(() => {
    if (client) {
      resetForm()
    }
  }, [client?.id])

  useEffect(() => {
    async function loadTags() {
      const result = await getAllTags()
      if (result.success && result.data) {
        setTags(result.data)
      }
    }
    if (open) {
      loadTags()
    }
  }, [open])

  async function handleCreateTag(tagName: string) {
    const trimmed = tagName.trim()
    if (!trimmed) return
    const result = await createTag(trimmed)
    if (result.success && result.data) {
      setTags(prev => [...prev, result.data!])
      setSelectedTagIds(prev => [...prev, result.data!.id])
      setTagInput("")
    }
  }

  function handleTagInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCreateTag(tagInput)
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!client) return
    setIsPending(true)

    const result = await updateClient({
      clientId: client.id,
      name,
      type: type as ClientType,
      documentType,
      documentNumber: documentNumber || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      birthDate: birthDate ? birthDate.toISOString() : null,
      city: city || null,
      notes: notes || null,
      tagIds: selectedTagIds,
    })

    setIsPending(false)

    if (result.success) {
      toast.success("Cliente actualizado exitosamente")
      onOpenChange(false)
    } else {
      toast.error(result.error || "No se pudo actualizar el cliente")
    }
  }

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4" />
              Editar Cliente
            </DialogTitle>
            <DialogDescription>
              Modifica la información del cliente. Los campos con asterisco son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-name">Nombre / Razón Social *</FieldLabel>
                <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required />
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
                  <div className="text-sm text-muted-foreground py-2 capitalize">
                    {client.status === "ACTIVO" ? "Activo" : client.status === "INACTIVO" ? "Inactivo" : "Moroso"}
                  </div>
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
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="RUT">RUT</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-doc-number">Número Documento</FieldLabel>
                  <Input id="edit-doc-number" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="edit-email">Correo Electrónico</FieldLabel>
                <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-phone">Teléfono / Celular</FieldLabel>
                <Input id="edit-phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-address">Dirección</FieldLabel>
                <Input id="edit-address" value={address} onChange={e => setAddress(e.target.value)} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Fecha de Nacimiento</FieldLabel>
                  <Popover>
                    <PopoverTrigger>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 size-4" />
                        {birthDate ? format(birthDate, "PPP", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-city">Ciudad</FieldLabel>
                  <Input id="edit-city" value={city} onChange={e => setCity(e.target.value)} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="edit-notes">Notas</FieldLabel>
                <Textarea id="edit-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
              </Field>

              <Field>
                <FieldLabel>Etiquetas</FieldLabel>
                <div className="space-y-2">
                  {selectedTagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTagIds.map(tagId => {
                        const tag = tags.find(t => t.id === tagId)
                        if (!tag) return null
                        return (
                          <Badge
                            key={tagId}
                            variant="secondary"
                            className="gap-1 pl-1.5"
                            style={tag.color ? {
                              backgroundColor: tag.color + "20",
                              color: tag.color,
                              borderColor: tag.color + "40",
                            } : undefined}
                          >
                            <Tag className="size-3" />
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => toggleTag(tagId)}
                              className="ml-0.5 hover:opacity-70"
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 items-center">
                    <Input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Escribir etiqueta y presionar Enter..."
                      className="h-8 min-w-[180px] text-xs"
                    />
                  </div>

                  {tags.filter(t => !selectedTagIds.includes(t.id)).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {tags.filter(t => !selectedTagIds.includes(t.id)).map(tag => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted gap-1"
                          style={tag.color ? {
                            borderColor: tag.color,
                            color: tag.color,
                          } : undefined}
                          onClick={() => toggleTag(tag.id)}
                        >
                          <Tag className="size-3" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !name}>Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
