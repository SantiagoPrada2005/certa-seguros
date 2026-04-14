"use client"

import { useState, useEffect } from "react"
import { SectionCard } from "@/components/admin/section-card"
import { Button } from "@/components/ui/button"
import { FileTextIcon } from "lucide-react"
import { ProspectosTable } from "@/components/admin/prospectos/prospectos-table"
import { NuevoProspectoDialog } from "@/components/admin/prospectos/nuevo-prospecto-dialog"

export default function ProspectosClient({
  initialProspects,
  kpiData,
}: {
  initialProspects: any[]
  kpiData: { total: number; porContactar: number; enProceso: number; descartados: number }
}) {
  const [statusFilter, setStatusFilter] = useState<string>("all")

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

      {/* KPI Cards — clickable to filter table */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Prospectos"
          value={kpiData.total.toLocaleString("es-CO")}
          footerTitle="Todos los registros"
        />
        <button onClick={() => setStatusFilter("NUEVO")} className="text-left hover:opacity-80 transition-opacity">
          <SectionCard
            title="Por Contactar"
            value={kpiData.porContactar.toLocaleString("es-CO")}
            trend="down"
            trendValue={kpiData.porContactar > 0 ? `${kpiData.porContactar} pendientes` : "Al día"}
            footerTitle="Click para filtrar →"
          />
        </button>
        <button onClick={() => setStatusFilter("EN_PROCESO")} className="text-left hover:opacity-80 transition-opacity">
          <SectionCard
            title="En Proceso"
            value={kpiData.enProceso.toLocaleString("es-CO")}
            footerTitle="Click para filtrar →"
          />
        </button>
        <button onClick={() => setStatusFilter("DESCARTADO")} className="text-left hover:opacity-80 transition-opacity">
          <SectionCard
            title="Descartados"
            value={kpiData.descartados.toLocaleString("es-CO")}
            trend="up"
            trendValue="Click para filtrar →"
            footerTitle="Estado: DESCARTADO"
          />
        </button>
      </div>

      {/* Table — Client Component with real data + filter/search */}
      <ProspectosTable
        initialProspects={initialProspects}
        externalStatusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  )
}
