import { SectionCard } from "@/components/admin/section-card";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { ProspectosTable } from "@/components/admin/prospectos/prospectos-table";
import { NuevoProspectoDialog } from "@/components/admin/prospectos/nuevo-prospecto-dialog";
import prisma from "@/lib/prisma";

export default async function ProspectosPage() {
  // — KPI stats: fetched server-side
  const [total, porContactar, enProceso, descartados] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.count({ where: { status: "NUEVO" } }),
    prisma.prospect.count({ where: { status: "EN_PROCESO" } }),
    prisma.prospect.count({ where: { status: "DESCARTADO" } }),
  ]);

  // — Initial data for the table (first page rendered without loading state)
  const prospectsRaw = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      services: {
        include: { service: true },
      },
    },
  });

  const initialProspects = prospectsRaw.map(prospect => ({
    ...prospect,
    services: prospect.services.map(ps => ({
      ...ps,
      service: ps.service ? {
        ...ps.service,
        price: ps.service.price ? ps.service.price.toNumber() : null
      } : null
    }))
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prospectos</h1>
          <p className="text-muted-foreground mt-2">
            Gestión centralizada de prospectos potenciales.
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
          title="Descartados"
          value={descartados.toLocaleString("es-CO")}
          trend="up"
          trendValue="Estado: DESCARTADO"
          footerTitle="No convertidos"
        />
      </div>

      {/* Table — Client Component with real data + filter/search */}
      <ProspectosTable initialProspects={initialProspects as any} />
    </div>
  );
}
