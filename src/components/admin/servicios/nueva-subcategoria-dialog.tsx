"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FolderTreeIcon, Loader2Icon } from "lucide-react";
import { createServiceSubcategory } from "@/app/admin/actions";
import { toast } from "sonner";

interface NuevaSubcategoriaDialogProps {
  categories: { id: string; name: string }[];
}

export function NuevaSubcategoriaDialog({ categories }: NuevaSubcategoriaDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    categoryId: "",
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre de la subcategoría es requerido");
      return;
    }
    if (!form.categoryId) {
      toast.error("Debes seleccionar una categoría principal");
      return;
    }

    setLoading(true);
    const result = await createServiceSubcategory(form);
    setLoading(false);

    if (result.success) {
      toast.success("Subcategoría creada exitosamente");
      setOpen(false);
      setForm({ name: "", categoryId: "" });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" disabled={categories.length === 0} />}>
        <FolderTreeIcon data-icon="inline-start" />
        Nueva Subcategoría
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Subcategoría</DialogTitle>
            <DialogDescription>
              Crea una división específica dentro de una categoría existente.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="sub-categoria">Categoría Principal *</FieldLabel>
              <Select value={form.categoryId} onValueChange={(v) => handleChange("categoryId", v ?? "")}>
                <SelectTrigger id="sub-categoria">
                  <SelectValue placeholder="Seleccionar">
                    {form.categoryId && (() => {
                      const cat = categories.find(c => c.id === form.categoryId);
                      return cat ? <span>{cat.name}</span> : null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="sub-nombre">Nombre de Subcategoría *</FieldLabel>
              <Input
                id="sub-nombre"
                placeholder="Ej. Accidentes Personales"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || categories.length === 0}>
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              Crear Subcategoría
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
