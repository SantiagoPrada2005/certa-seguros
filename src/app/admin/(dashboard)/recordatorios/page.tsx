import { SectionCard } from "@/components/admin/section-card";
import { RecordatoriosTable } from "@/components/admin/recordatorios/recordatorios-table";
import { NuevoRecordatorioDialog } from "@/components/admin/recordatorios/nuevo-recordatorio-dialog";
import prisma from "@/lib/prisma";

export default async function RecordatoriosPage() {
  const [total, pendientes, vencidos, completados] = await Promise.all([
    prisma.reminder.count(),
    prisma.reminder.count({ where: { status: "PENDIENTE" } }),
    prisma.reminder.count({ where: { status: "VENCIDO" } }),
    prisma.reminder.count({ where: { status: "COMPLETADO" } }),
  ]);

  const initialReminders = await prisma.reminder.findMany({
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recordatorios</h1>
          <p className="mt-2 text-muted-foreground">
            Controla vencimientos de pólizas, llamadas y seguimientos de clientes.
          </p>
        </div>
        <NuevoRecordatorioDialog />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Recordatorios"
          value={total.toLocaleString("es-CO")}
          footerTitle="Todos los registros"
        />
        <SectionCard
          title="Pendientes"
          value={pendientes.toLocaleString("es-CO")}
          trend={pendientes > 5 ? "down" : "up"}
          trendValue={pendientes > 0 ? `${pendientes} por atender` : "Al día"}
          footerTitle="Estado: PENDIENTE"
        />
        <SectionCard
          title="Vencidos"
          value={vencidos.toLocaleString("es-CO")}
          trend={vencidos > 0 ? "down" : "up"}
          trendValue={vencidos > 0 ? "Requieren atención urgente" : "Sin vencidos"}
          footerTitle="Estado: VENCIDO"
        />
        <SectionCard
          title="Completados"
          value={completados.toLocaleString("es-CO")}
          trend="up"
          trendValue="Resueltos exitosamente"
          footerTitle="Estado: COMPLETADO"
        />
      </div>

      {/* Table */}
      <RecordatoriosTable initialReminders={initialReminders as any} />
    </div>
  );
}
