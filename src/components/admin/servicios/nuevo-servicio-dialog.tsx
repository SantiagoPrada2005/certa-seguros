"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel,
} from "@/components/ui/select";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { createService } from "@/app/admin/actions";
import { toast } from "sonner";

interface NuevoServicioDialogProps {
  categories: {
    id: string;
    name: string;
    subcategories: { id: string; name: string }[];
  }[];
}

export function NuevoServicioDialog({ categories }: NuevoServicioDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    validityType: "",
    price: "",
    priceDescription: "",
    subcategoryId: "",
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre del servicio es requerido");
      return;
    }
    if (!form.subcategoryId) {
      toast.error("Debes asociar el servicio a una subcategoría obligatoriamente");
      return;
    }
    setLoading(true);
    const result = await createService(form);
    setLoading(false);
    if (result.success) {
      toast.success("Servicio creado exitosamente");
      setOpen(false);
      setForm({ name: "", description: "", validityType: "", price: "", priceDescription: "", subcategoryId: "" });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button render={<DialogTrigger />}>
        <PlusIcon data-icon="inline-start" />
        Nuevo Servicio
      </Button>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Servicio</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del nuevo servicio para añadirlo al catálogo activo.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="svc-name">Nombre del Servicio *</FieldLabel>
              <Input
                id="svc-name"
                placeholder="Ej. Seguro Todo Riesgo"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="svc-subcategory">Clasificación / Subcategoría *</FieldLabel>
              <Select value={form.subcategoryId} onValueChange={(v) => handleChange("subcategoryId", v ?? "")} required>
                <SelectTrigger id="svc-subcategory">
                  <SelectValue placeholder="Seleccionar">
                    {form.subcategoryId && (() => {
                      for (const cat of categories) {
                        for (const sub of cat.subcategories) {
                          if (sub.id === form.subcategoryId) return <span>{sub.name}</span>;
                        }
                      }
                      return null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectGroup key={cat.id}>
                      <SelectLabel>{cat.name}</SelectLabel>
                      {cat.subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="svc-desc">Descripción</FieldLabel>
              <Textarea
                id="svc-desc"
                placeholder="Detalles sobre lo que incluye el servicio..."
                className="min-h-[80px]"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="svc-validity">Vigencia</FieldLabel>
                <Select value={form.validityType} onValueChange={(v) => handleChange("validityType", v ?? "")}>
                  <SelectTrigger id="svc-validity">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNICA_VEZ">Única vez</SelectItem>
                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                    <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                    <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="svc-price">Precio (COP)</FieldLabel>
                <Input
                  id="svc-price"
                  type="number"
                  placeholder="Ej. 1200000"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="svc-price-desc">Descripción del precio (opcional)</FieldLabel>
              <Input
                id="svc-price-desc"
                placeholder="Ej. Desde $1.2M / Depende del perfil"
                value={form.priceDescription}
                onChange={(e) => handleChange("priceDescription", e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || categories.length === 0}>
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              Guardar Servicio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
