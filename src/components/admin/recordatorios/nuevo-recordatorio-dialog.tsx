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
import { PlusIcon, Loader2Icon, UsersIcon, TargetIcon } from "lucide-react";
import { createReminder } from "@/app/admin/actions";
import { fetchClients, type ClientRecord, fetchProspects, type ProspectRecord } from "@/lib/api-client";
import { toast } from "sonner";

export function NuevoRecordatorioDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [clients, setClients] = React.useState<ClientRecord[]>([]);
  const [prospects, setProspects] = React.useState<ProspectRecord[]>([]);
  const [selectedType, setSelectedType] = React.useState<'client' | 'prospect'>('client');

  const [form, setForm] = React.useState({
    type: "",
    priority: "MEDIA",
    status: "PENDIENTE",
    dueDate: "",
    description: "",
    clientId: "",
    prospectId: "",
  });

  React.useEffect(() => {
    if (open) {
      fetchClients().then(setClients).catch(console.error);
      fetchProspects().then(setProspects).catch(console.error);
    }
  }, [open]);

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.dueDate) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    if (selectedType === 'client' && !form.clientId) {
      toast.error("Selecciona un cliente");
      return;
    }
    if (selectedType === 'prospect' && !form.prospectId) {
      toast.error("Selecciona un prospecto");
      return;
    }
    setLoading(true);
    const payload = {
      type: form.type,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate,
      description: form.description,
      clientId: selectedType === 'client' ? form.clientId : "",
      prospectId: selectedType === 'prospect' ? form.prospectId : "",
    };
    const result = await createReminder(payload as any);
    setLoading(false);
    if (result.success) {
      toast.success("Recordatorio creado exitosamente");
      setOpen(false);
      setForm({ type: "", priority: "MEDIA", status: "PENDIENTE", dueDate: "", description: "", clientId: "", prospectId: "" });
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
              Programa una alerta de seguimiento o vencimiento para un cliente o prospecto.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Tipo de Contacto *</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={selectedType === 'client' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setSelectedType('client'); setForm(prev => ({ ...prev, clientId: "", prospectId: "" })); }}
                  className="gap-2"
                >
                  <UsersIcon className="size-4" />
                  Cliente
                </Button>
                <Button
                  type="button"
                  variant={selectedType === 'prospect' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setSelectedType('prospect'); setForm(prev => ({ ...prev, clientId: "", prospectId: "" })); }}
                  className="gap-2"
                >
                  <TargetIcon className="size-4" />
                  Prospecto
                </Button>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="r-client">
                {selectedType === 'client' ? 'Cliente *' : 'Prospecto *'}
              </FieldLabel>
              <Select
                value={selectedType === 'client' ? form.clientId : form.prospectId}
                onValueChange={(v) => handleChange(selectedType === 'client' ? 'clientId' : 'prospectId', v ?? "")}
              >
                <SelectTrigger id="r-client">
                  <SelectValue placeholder={selectedType === 'client' ? 'Seleccionar cliente...' : 'Seleccionar prospecto...'}>
                    {(() => {
                      const id = selectedType === 'client' ? form.clientId : form.prospectId;
                      const list = selectedType === 'client' ? clients : prospects;
                      const item = list.find(c => c.id === id);
                      return item ? <span>{item.name}</span> : null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(selectedType === 'client' ? clients : prospects).map((c) => (
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
