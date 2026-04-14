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
import { FolderPlusIcon, Loader2Icon } from "lucide-react";
import { createServiceCategory } from "@/app/admin/actions";
import { toast } from "sonner";

export function NuevaCategoriaDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    description: "",
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }
    setLoading(true);
    const result = await createServiceCategory(form);
    setLoading(false);
    if (result.success) {
      toast.success("Categoría creada exitosamente");
      setOpen(false);
      setForm({ name: "", description: "" });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button render={<DialogTrigger />} variant="outline">
        <FolderPlusIcon data-icon="inline-start" />
        Nueva Categoría
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Categoría</DialogTitle>
            <DialogDescription>
              Define una nueva categoría principal para agrupar servicios relacionados.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="cat-nombre">Nombre de Categoría *</FieldLabel>
              <Input
                id="cat-nombre"
                placeholder="Ej. Seguros de Vida"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cat-desc">Descripción (Opcional)</FieldLabel>
              <Textarea
                id="cat-desc"
                placeholder="Breve explicación del alcance..."
                className="min-h-[80px]"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              Crear Categoría
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
