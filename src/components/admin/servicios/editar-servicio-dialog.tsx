"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel,
} from "@/components/ui/select";
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { updateService } from "@/lib/api-client";
import { toast } from "sonner";
import type { ServiceRecord } from "@/lib/api-client";

interface EditarServicioDialogProps {
  service: ServiceRecord | null;
  categories: {
    id: string;
    name: string;
    subcategories: { id: string; name: string }[];
  }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const validityOptions = [
  { value: "UNICA_VEZ", label: "Única vez" },
  { value: "MENSUAL", label: "Mensual" },
  { value: "TRIMESTRAL", label: "Trimestral" },
  { value: "SEMESTRAL", label: "Semestral" },
  { value: "ANUAL", label: "Anual" },
];

export function EditarServicioDialog({
  service,
  categories,
  open,
  onOpenChange,
  onSaved,
}: EditarServicioDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    validityType: "",
    price: "",
    priceDescription: "",
    subcategoryId: "",
    isActive: true,
  });

  React.useEffect(() => {
    if (service && open) {
      setForm({
        name: service.name,
        description: service.description ?? "",
        validityType: service.validityType ?? "",
        price: service.price != null ? String(service.price) : "",
        priceDescription: service.priceDescription ?? "",
        subcategoryId: service.subcategoryId ?? "",
        isActive: service.isActive,
      });
    }
  }, [service, open]);

  const handleChange = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!service) return;
    if (!form.name.trim()) {
      toast.error("El nombre del servicio es requerido");
      return;
    }
    if (!form.subcategoryId) {
      toast.error("Debes asociar el servicio a una subcategoría obligatoriamente");
      return;
    }

    setLoading(true);
    try {
      const priceValue = form.price.trim() === "" ? null : Number(form.price);
      if (priceValue !== null && isNaN(priceValue)) {
        toast.error("Valor inválido");
        setLoading(false);
        return;
      }

      await updateService(service.id, {
        name: form.name,
        description: form.description || undefined,
        validityType: form.validityType || undefined,
        price: priceValue,
        priceDescription: form.priceDescription || undefined,
        subcategoryId: form.subcategoryId,
        isActive: form.isActive,
      });

      toast.success("Servicio actualizado");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Editar Servicio</DialogTitle>
          <DialogDescription>
            Modifica los detalles del servicio seleccionado.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="py-4">
          <Field>
            <FieldLabel htmlFor="edit-svc-name">Nombre del Servicio *</FieldLabel>
            <Input
              id="edit-svc-name"
              placeholder="Ej. Seguro Todo Riesgo"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-svc-subcategory">Clasificación / Subcategoría *</FieldLabel>
            <Select
              value={form.subcategoryId}
              onValueChange={(v) => handleChange("subcategoryId", v ?? "")}
              required
            >
              <SelectTrigger id="edit-svc-subcategory">
                <SelectValue placeholder="Seleccionar" />
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
            <FieldLabel htmlFor="edit-svc-desc">Descripción</FieldLabel>
            <Textarea
              id="edit-svc-desc"
              placeholder="Detalles sobre lo que incluye el servicio..."
              className="min-h-[80px]"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="edit-svc-validity">Vigencia</FieldLabel>
              <Select
                value={form.validityType}
                onValueChange={(v) => handleChange("validityType", v ?? "")}
              >
                <SelectTrigger id="edit-svc-validity">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {validityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-svc-price">Precio (COP)</FieldLabel>
              <Input
                id="edit-svc-price"
                type="number"
                placeholder="Ej. 1200000"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="edit-svc-price-desc">Descripción del precio (opcional)</FieldLabel>
            <Input
              id="edit-svc-price-desc"
              placeholder="Ej. Desde $1.2M / Depende del perfil"
              value={form.priceDescription}
              onChange={(e) => handleChange("priceDescription", e.target.value)}
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="edit-svc-active">Activo</FieldLabel>
              <Switch
                id="edit-svc-active"
                checked={form.isActive}
                onCheckedChange={(v) => handleChange("isActive", v)}
              />
            </div>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
