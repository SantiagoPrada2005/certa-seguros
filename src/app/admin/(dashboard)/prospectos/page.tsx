import { SectionCard } from "@/components/admin/section-card";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { ProspectosTable } from "@/components/admin/prospectos/prospectos-table";
import { NuevoProspectoDialog } from "@/components/admin/prospectos/nuevo-prospecto-dialog";
import prisma from "@/lib/prisma";

export default async function ProspectosPage() {
  // — KPI stats: fetched server-side
  const [total, porContactar, enProceso, activos] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { status: "NUEVO" } }),
    prisma.client.count({ where: { status: "EN_PROCESO" } }),
    prisma.client.count({ where: { status: "ACTIVO" } }),
  ]);

  // — Initial data for the table (first page rendered without loading state)
  const clientsRaw = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      services: {
        include: { service: true },
      },
    },
  });

  const initialClients = clientsRaw.map(client => ({
    ...client,
    services: client.services.map(cs => ({
      ...cs,
      service: cs.service ? {
        ...cs.service,
        price: cs.service.price ? cs.service.price.toNumber() : null
      } : null
    }))
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prospectos</h1>
          <p className="text-muted-foreground mt-2">
            Gestión centralizada de clientes y prospectos capturados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NuevoProspectoDialog />
          <Button variant="outline">
            <FileTextIcon data-icon="inline-start" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards — server-rendered with real counts */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Prospectos"
          value={total.toLocaleString("es-CO")}
          footerTitle="Todos los registros"
        />
        <SectionCard
          title="Por Contactar"
          value={porContactar.toLocaleString("es-CO")}
          trend="down"
          trendValue={porContactar > 0 ? `${porContactar} pendientes` : "Al día"}
          footerTitle="Estado: NUEVO"
        />
        <SectionCard
          title="En Proceso"
          value={enProceso.toLocaleString("es-CO")}
          footerTitle="Gestión activa"
        />
        <SectionCard
          title="Clientes Activos"
          value={activos.toLocaleString("es-CO")}
          trend="up"
          trendValue="Estado: ACTIVO"
          footerTitle="Convertidos"
        />
      </div>

      {/* Table — Client Component with real data + filter/search */}
      <ProspectosTable initialClients={initialClients as any} />
    </div>
  );
}
