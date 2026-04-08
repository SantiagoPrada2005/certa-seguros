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
import { updateClient } from "@/app/admin/actions";
import { type ClientRecord } from "@/lib/api-client";
import { toast } from "sonner";

interface EditarProspectoDialogProps {
  client: ClientRecord | null;
  onClose: () => void;
  onSuccess: (updatedClient: any) => void;
}

export function EditarProspectoDialog({ client, onClose, onSuccess }: EditarProspectoDialogProps) {
  const open = !!client;
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    type: "INDIVIDUAL",
    documentType: "",
    documentNumber: "",
    source: "DIRECTOS",
  });

  // Populate form when client changes
  React.useEffect(() => {
    if (client) {
      setForm({
        name: client.name ?? "",
        email: client.email ?? "",
        phone: client.phone ?? "",
        type: client.type ?? "INDIVIDUAL",
        documentType: client.documentType ?? "",
        documentNumber: client.documentNumber ?? "",
        source: client.source ?? "DIRECTOS",
      });
    }
  }, [client]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    
    if (!form.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setLoading(true);
    const result = await updateClient(client.id, form);
    setLoading(false);
    
    if (result.success) {
      toast.success("Prospecto actualizado exitosamente");
      // Create partial updated client to apply to UI state immediately
      onSuccess({ ...client, ...form });
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
              Modifica la información básica del prospecto o cliente.
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
