"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2Icon } from "lucide-react";
import { updateProspect } from "@/app/admin/(dashboard)/prospectos/_actions/prospect-actions";
import { type ProspectRecord } from "@/lib/api-client";
import { toast } from "sonner";

interface EditarProspectoDialogProps {
  prospect: ProspectRecord | null;
  onClose: () => void;
  onSuccess: (updatedProspect: any) => void;
}

export function EditarProspectoDialog({ prospect, onClose, onSuccess }: EditarProspectoDialogProps) {
  const open = !!prospect;
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    type: "INDIVIDUAL" as "INDIVIDUAL" | "BUSINESS",
    documentType: "" as string,
    documentNumber: "",
    source: "DIRECTOS" as string,
  });

  // Populate form when prospect changes
  React.useEffect(() => {
    if (prospect) {
      setForm({
        name: prospect.name ?? "",
        email: prospect.email ?? "",
        phone: prospect.phone ?? "",
        type: prospect.type ?? "INDIVIDUAL",
        documentType: prospect.documentType ?? "",
        documentNumber: prospect.documentNumber ?? "",
        source: prospect.source ?? "DIRECTOS",
      });
    }
  }, [prospect]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospect) return;

    if (!form.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setLoading(true);
    const result = await updateProspect(prospect.id, {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      type: form.type,
      documentType: (form.documentType as "CC" | "NIT" | "CE" | "PASAPORTE" | "TI" | "RUT" | "") || null,
      documentNumber: form.documentNumber || null,
      source: (form.source as "WEB_PUBLICA" | "REFERIDOS" | "REDES_SOCIALES" | "DIRECTOS" | "") || null,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Prospecto actualizado exitosamente");
      // Create partial updated prospect to apply to UI state immediately
      onSuccess({ ...prospect, ...form });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Prospecto</DialogTitle>
            <DialogDescription>
              Modifica la información básica del prospecto.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="e-name">Nombre / Razón Social *</FieldLabel>
              <Input
                id="e-name"
                placeholder="Ej. Juan Pérez o Empresa S.A."
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="e-email">Correo Electrónico</FieldLabel>
              <Input
                id="e-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="e-phone">Celular</FieldLabel>
                <Input
                  id="e-phone"
                  placeholder="310 000 0000"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="e-type">Tipo</FieldLabel>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v ?? "INDIVIDUAL")}>
                  <SelectTrigger id="e-type">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Persona</SelectItem>
                    <SelectItem value="BUSINESS">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="e-doctype">Tipo Documento</FieldLabel>
                <Select value={form.documentType} onValueChange={(v) => handleChange("documentType", v ?? "")}>
                  <SelectTrigger id="e-doctype">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">CC</SelectItem>
                    <SelectItem value="NIT">NIT</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="RUT">RUT</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="e-docnum">Número Documento</FieldLabel>
                <Input
                  id="e-docnum"
                  placeholder="123.456.789"
                  value={form.documentNumber}
                  onChange={(e) => handleChange("documentNumber", e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="e-source">Origen</FieldLabel>
              <Select value={form.source} onValueChange={(v) => handleChange("source", v ?? "DIRECTOS")}>
                <SelectTrigger id="e-source">
                  <SelectValue placeholder="Origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB_PUBLICA">Web Pública</SelectItem>
                  <SelectItem value="REFERIDOS">Referidos</SelectItem>
                  <SelectItem value="REDES_SOCIALES">Redes Sociales</SelectItem>
                  <SelectItem value="DIRECTOS">Directos</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
