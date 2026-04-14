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
import { PlusIcon, Loader2Icon } from "lucide-react";
import { createProspect } from "@/app/admin/(dashboard)/prospectos/_actions/prospect-actions";
import { toast } from "sonner";

export function NuevoProspectoDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    type: "INDIVIDUAL" as "INDIVIDUAL" | "BUSINESS",
    documentType: "" as "CC" | "NIT" | "CE" | "PASAPORTE" | "TI" | "RUT" | "",
    documentNumber: "",
    source: "DIRECTOS" as "WEB_PUBLICA" | "REFERIDOS" | "REDES_SOCIALES" | "DIRECTOS",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setLoading(true);
    const result = await createProspect({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      type: form.type,
      documentType: form.documentType || null,
      documentNumber: form.documentNumber || null,
      source: form.source,
      status: "NUEVO",
    });
    setLoading(false);
    if (result.success) {
      toast.success("Prospecto creado exitosamente");
      setOpen(false);
      setForm({ name: "", email: "", phone: "", type: "INDIVIDUAL", documentType: "", documentNumber: "", source: "DIRECTOS" });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Nuevo Prospecto
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Añadir Prospecto</DialogTitle>
            <DialogDescription>
              Ingresa la información del prospecto para registrarlo en la plataforma.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="p-name">Nombre / Razón Social *</FieldLabel>
              <Input
                id="p-name"
                placeholder="Ej. Juan Pérez o Empresa S.A."
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="p-email">Correo Electrónico</FieldLabel>
              <Input
                id="p-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="p-phone">Celular</FieldLabel>
                <Input
                  id="p-phone"
                  placeholder="310 000 0000"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="p-type">Tipo</FieldLabel>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v ?? "INDIVIDUAL")}>
                  <SelectTrigger id="p-type">
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
                <FieldLabel htmlFor="p-doctype">Tipo Documento</FieldLabel>
                <Select value={form.documentType} onValueChange={(v) => handleChange("documentType", v ?? "")}>
                  <SelectTrigger id="p-doctype">
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
                <FieldLabel htmlFor="p-docnum">Número Documento</FieldLabel>
                <Input
                  id="p-docnum"
                  placeholder="123.456.789"
                  value={form.documentNumber}
                  onChange={(e) => handleChange("documentNumber", e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="p-source">Origen</FieldLabel>
              <Select value={form.source} onValueChange={(v) => handleChange("source", v ?? "DIRECTOS")}>
                <SelectTrigger id="p-source">
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              Guardar Prospecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
