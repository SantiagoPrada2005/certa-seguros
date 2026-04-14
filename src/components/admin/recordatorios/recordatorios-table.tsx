"use client";

import * as React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircleIcon, Loader2Icon, FilterIcon } from "lucide-react";
import { fetchReminders, type ReminderRecord } from "@/lib/api-client";
import { markReminderComplete } from "@/app/admin/actions";
import { toast } from "sonner";

const priorityConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  INMEDIATA: { variant: "destructive", label: "Inmediata" },
  CRITICA:   { variant: "destructive", label: "Crítica" },
  ALTA:      { variant: "default",     label: "Alta" },
  MEDIA:     { variant: "secondary",   label: "Media" },
  BAJA:      { variant: "outline",     label: "Baja" },
};

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  PENDIENTE:   { variant: "secondary", label: "Pendiente" },
  EN_PROCESO:  { variant: "default",   label: "En Proceso" },
  COMPLETADO:  { variant: "outline",   label: "Completado" },
  VENCIDO:     { variant: "destructive", label: "Vencido" },
};

const typeLabel: Record<string, string> = {
  RENOVACION_SOAT:   "Renovación SOAT",
  RENOVACION_POLIZA: "Renovación Póliza",
  SEGUIMIENTO_ARL:   "Seguimiento ARL",
  LLAMADA:           "Llamada",
  VISITA:            "Visita",
  OTRO:              "Otro",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

interface RecordatoriosTableProps {
  initialReminders: ReminderRecord[];
}

export function RecordatoriosTable({ initialReminders }: RecordatoriosTableProps) {
  const [reminders, setReminders] = React.useState<ReminderRecord[]>(initialReminders);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Sync state when Server Component re-renders (e.g. after revalidatePath)
  React.useEffect(() => {
    setReminders(initialReminders);
  }, [initialReminders]);

  React.useEffect(() => {
    setLoading(true);
    fetchReminders({ status: statusFilter !== "all" ? statusFilter : undefined })
      .then(setReminders)
      .catch(() => toast.error("Error al cargar los recordatorios"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const handleComplete = async (id: string) => {
    setActionLoading(id);
    const result = await markReminderComplete(id);
    if (result.success) {
      setReminders((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: "COMPLETADO" } : r)
      );
      toast.success("Recordatorio marcado como completado");
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Recordatorios Programados</CardTitle>
            <CardDescription>Seguimiento de vencimientos y actividades de atención al cliente.</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <FilterIcon data-icon="inline-start" className="size-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
              <SelectItem value="COMPLETADO">Completado</SelectItem>
              <SelectItem value="VENCIDO">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => {
                const priority = priorityConfig[reminder.priority] ?? { variant: "outline" as const, label: reminder.priority };
                const status = statusConfig[reminder.status] ?? { variant: "outline" as const, label: reminder.status };
                return (
                  <TableRow key={reminder.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{typeLabel[reminder.type] ?? reminder.type}</span>
                        {reminder.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {reminder.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{reminder.client?.name ?? reminder.prospect?.name ?? "Sin asignar"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(reminder.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {reminder.status !== "COMPLETADO" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === reminder.id}
                          onClick={() => handleComplete(reminder.id)}
                          className="gap-1.5"
                        >
                          {actionLoading === reminder.id
                            ? <Loader2Icon className="size-3.5 animate-spin" />
                            : <CheckCircleIcon className="size-3.5 text-emerald-500" />}
                          Completar
                        </Button>
                      )}
                      {reminder.status === "COMPLETADO" && (
                        <span className="text-xs text-muted-foreground">Completado</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {reminders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No hay recordatorios con el filtro seleccionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
