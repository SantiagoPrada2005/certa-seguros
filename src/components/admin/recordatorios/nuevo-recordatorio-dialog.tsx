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
import { createReminder } from "@/app/admin/actions";
import { fetchClients, type ClientRecord } from "@/lib/api-client";
import { toast } from "sonner";

export function NuevoRecordatorioDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [clients, setClients] = React.useState<ClientRecord[]>([]);

  const [form, setForm] = React.useState({
    type: "",
    priority: "MEDIA",
    status: "PENDIENTE",
    dueDate: "",
    description: "",
    clientId: "",
  });

  React.useEffect(() => {
    if (open) {
      fetchClients().then(setClients).catch(console.error);
    }
  }, [open]);

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.dueDate || !form.clientId) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    setLoading(true);
    const result = await createReminder(form);
    setLoading(false);
    if (result.success) {
      toast.success("Recordatorio creado exitosamente");
      setOpen(false);
      setForm({ type: "", priority: "MEDIA", status: "PENDIENTE", dueDate: "", description: "", clientId: "" });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Nuevo Recordatorio
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Recordatorio</DialogTitle>
            <DialogDescription>
              Programa una alerta de seguimiento o vencimiento para un cliente.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="r-client">Cliente *</FieldLabel>
              <Select value={form.clientId} onValueChange={(v) => handleChange("clientId", v ?? "")}>
                <SelectTrigger id="r-client">
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="r-type">Tipo *</FieldLabel>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v ?? "")}>
                  <SelectTrigger id="r-type">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RENOVACION_SOAT">Renovación SOAT</SelectItem>
                    <SelectItem value="RENOVACION_POLIZA">Renovación Póliza</SelectItem>
                    <SelectItem value="SEGUIMIENTO_ARL">Seguimiento ARL</SelectItem>
                    <SelectItem value="LLAMADA">Llamada</SelectItem>
                    <SelectItem value="VISITA">Visita</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="r-priority">Prioridad</FieldLabel>
                <Select value={form.priority} onValueChange={(v) => handleChange("priority", v ?? "MEDIA")}>
                  <SelectTrigger id="r-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INMEDIATA">Inmediata</SelectItem>
                    <SelectItem value="CRITICA">Crítica</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="BAJA">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="r-duedate">Fecha de Vencimiento *</FieldLabel>
              <Input
                id="r-duedate"
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="r-desc">Notas / Descripción</FieldLabel>
              <Textarea
                id="r-desc"
                placeholder="Contexto adicional del recordatorio..."
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
              Crear Recordatorio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
