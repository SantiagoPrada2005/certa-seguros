"use client";

import { SectionCard } from "@/components/admin/section-card";
import { formatCOPCompact } from "@/lib/format";

interface DashboardKPIsProps {
  stats: {
    monthlyRevenue: number;
    totalClients: number;
    totalProspects: number;
    activePolicies: number;
    pendingReminders: number;
    prospectsBreakdown: Record<string, number>;
  };
}

const prospectStatusLabel: Record<string, string> = {
  NUEVO: "Nuevos",
  CONTACTADO: "Contactados",
  EN_PROCESO: "En Proceso",
  DESCARTADO: "Descartados",
  CONVERTIDO: "Convertidos",
};

export function DashboardKPIs({ stats }: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-5 dark:*:data-[slot=card]:bg-card">
      <SectionCard
        title="Ingresos del Mes"
        value={formatCOPCompact(stats.monthlyRevenue)}
        trend="up"
        trendValue="Facturas pagas"
        footerTitle="Mes actual"
      />
      <SectionCard
        title="Clientes Activos"
        value={stats.totalClients.toLocaleString("es-CO")}
        trend="up"
        trendValue="Estado: ACTIVO"
        footerTitle="En base de datos"
      />
      <SectionCard
        title="Prospectos en Pipeline"
        value={stats.totalProspects.toLocaleString("es-CO")}
        trend="up"
        trendValue="Activos (no descartados)"
        footerTitle={
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {Object.entries(stats.prospectsBreakdown).map(([status, count]) => (
              <span key={status} className="text-muted-foreground">
                {prospectStatusLabel[status] || status}:{" "}
                <strong className="text-foreground">{count}</strong>
              </span>
            ))}
          </div>
        }
      />
      <SectionCard
        title="Pólizas Activas"
        value={stats.activePolicies.toLocaleString("es-CO")}
        trend="up"
        trendValue="Estado: ACTIVE"
        footerTitle="Vigentes actualmente"
      />
      <SectionCard
        title="Recordatorios Pendientes"
        value={stats.pendingReminders.toLocaleString("es-CO")}
        trend="down"
        trendValue="Por atender"
        footerTitle="Estado: PENDIENTE"
      />
    </div>
  );
}
