"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
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

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function DashboardKPIs({ stats }: DashboardKPIsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs hover:*:data-[slot=card]:shadow-md *:data-[slot=card]:transition-shadow sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 dark:*:data-[slot=card]:bg-card"
    >
      <motion.div variants={item}>
        <SectionCard
          title="Ingresos del Mes"
          value={formatCOPCompact(stats.monthlyRevenue)}
          trend="up"
          trendValue="Facturas pagas"
          footerTitle="Mes actual"
        />
      </motion.div>
      <motion.div variants={item}>
        <SectionCard
          title="Clientes Activos"
          value={stats.totalClients.toLocaleString("es-CO")}
          trend="up"
          trendValue="Estado: ACTIVO"
          footerTitle="En base de datos"
        />
      </motion.div>
      <motion.div variants={item}>
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
      </motion.div>
      <motion.div variants={item}>
        <SectionCard
          title="Pólizas Activas"
          value={stats.activePolicies.toLocaleString("es-CO")}
          trend="up"
          trendValue="Estado: ACTIVE"
          footerTitle="Vigentes actualmente"
        />
      </motion.div>
      <motion.div variants={item}>
        <SectionCard
          title="Recordatorios Pendientes"
          value={stats.pendingReminders.toLocaleString("es-CO")}
          trend="down"
          trendValue="Por atender"
          footerTitle="Estado: PENDIENTE"
        />
      </motion.div>
    </motion.div>
  );
}
