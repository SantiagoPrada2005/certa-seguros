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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { createGoal } from "@/app/admin/actions";
import { toast } from "sonner";

export function NuevaMetaDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    category: "",
    period: "",
    targetValue: "",
    unit: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.period || !form.targetValue || !form.unit || !form.startDate || !form.endDate) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    setLoading(true);
    const result = await createGoal(form);
    setLoading(false);
    if (result.success) {
      toast.success("Meta creada exitosamente");
      setOpen(false);
      setForm({ name: "", description: "", category: "", period: "", targetValue: "", unit: "", startDate: "", endDate: "" });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Nueva Meta
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Meta</DialogTitle>
            <DialogDescription>
              Define una meta cuantificable de crecimiento con un período y objetivo claros.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="m-name">Nombre de la Meta *</FieldLabel>
              <Input
                id="m-name"
                placeholder="Ej. Clientes nuevos Q2"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="m-desc">Descripción</FieldLabel>
              <Textarea
                id="m-desc"
                placeholder="Detalla el contexto y criterios de la meta..."
                className="min-h-[70px]"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="m-category">Categoría *</FieldLabel>
                <Select value={form.category} onValueChange={(v) => handleChange("category", v ?? "")}>
                  <SelectTrigger id="m-category">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VENTAS">Ventas</SelectItem>
                    <SelectItem value="CLIENTES">Clientes</SelectItem>
                    <SelectItem value="RENOVACIONES">Renovaciones</SelectItem>
                    <SelectItem value="INGRESOS">Ingresos</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="m-period">Período *</FieldLabel>
                <Select value={form.period} onValueChange={(v) => handleChange("period", v ?? "")}>
                  <SelectTrigger id="m-period">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                    <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="m-target">Objetivo (número) *</FieldLabel>
                <Input
                  id="m-target"
                  type="number"
                  min="1"
                  placeholder="Ej. 50"
                  value={form.targetValue}
                  onChange={(e) => handleChange("targetValue", e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="m-unit">Unidad *</FieldLabel>
                <Input
                  id="m-unit"
                  placeholder='Ej. "pólizas" o "COP"'
                  value={form.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  required
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="m-start">Fecha Inicio *</FieldLabel>
                <Input
                  id="m-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="m-end">Fecha Fin *</FieldLabel>
                <Input
                  id="m-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  required
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              Crear Meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
