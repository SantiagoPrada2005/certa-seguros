"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Loader2Icon, UserPlusIcon } from "lucide-react";
import { type ProspectRecord } from "@/lib/api-client";
import { toast } from "sonner";

interface ConvertirClienteDialogProps {
  prospect: ProspectRecord | null;
  onClose: () => void;
  onSuccess: (data: { prospectId: string; birthDate?: string | null; city?: string | null; notes?: string | null }) => void;
}

export function ConvertirClienteDialog({ prospect, onClose, onSuccess }: ConvertirClienteDialogProps) {
  const open = !!prospect;
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    birthDate: "",
    city: "",
    notes: "",
  });

  // Reset form when prospect changes
  React.useEffect(() => {
    if (prospect) {
      setForm({ birthDate: "", city: "", notes: "" });
    }
  }, [prospect]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospect) return;

    setLoading(true);
    await onSuccess({
      prospectId: prospect.id,
      birthDate: form.birthDate || null,
      city: form.city || null,
      notes: form.notes || null,
    });
    setLoading(false);
  };

  if (!prospect) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlusIcon className="size-5 text-primary" />
              Convertir a Cliente
            </DialogTitle>
            <DialogDescription>
              Estás convirtiendo a <strong>{prospect.name}</strong> en un cliente activo.
              Completa la información adicional necesaria.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="c-birthdate">Fecha de Nacimiento</FieldLabel>
              <Input
                id="c-birthdate"
                type="date"
                value={form.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="c-city">Ciudad</FieldLabel>
              <Input
                id="c-city"
                placeholder="Ej. Bogotá, Medellín, Cali..."
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="c-notes">Notas Adicionales</FieldLabel>
              <Textarea
                id="c-notes"
                placeholder="Información relevante sobre el cliente..."
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              Convertir a Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
