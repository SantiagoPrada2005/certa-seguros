"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { createClient, getAllTags, createTag } from "../actions"
import { toast } from "sonner"
import { PlusIcon, X, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

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
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined)
  const [city, setCity] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  // Tags state
  const [tags, setTags] = useState<{ id: string; name: string; color: string | null }[]>([])

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
    setIsPending(true)

    const result = await createClient({
      name,
      type: type as any,
      documentType,
      documentNumber,
      email: email || "",
      phone: phone || "",
      birthDate: birthDate ? birthDate.toISOString() : null,
      city: city || null,
      notes: notes || null,
      status: "ACTIVO",
      tagIds: selectedTagIds,
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
      setBirthDate(undefined)
      setCity("")
      setNotes("")
      setSelectedTagIds([])
      setTagInput("")
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Crea un nuevo cliente. Los campos con asterisco son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
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
                  <Select value="ACTIVO" disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVO">Activo</SelectItem>
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
                  <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                  <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="notes">Notas</FieldLabel>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
              </Field>

              <Field>
                <FieldLabel>Etiquetas</FieldLabel>
                <div className="space-y-2">
                  {/* Selected tags */}
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

                  {/* Tag input + existing tags */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <Input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Escribir etiqueta y presionar Enter..."
                      className="h-8 min-w-[180px] text-xs"
                    />
                  </div>

                  {/* Existing tags to click */}
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !name}>Guardar Cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
