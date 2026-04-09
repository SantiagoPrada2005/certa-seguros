import { SectionCard } from "@/components/admin/section-card";
import { MetasList } from "@/components/admin/metas/metas-list";
import { NuevaMetaDialog } from "@/components/admin/metas/nueva-meta-dialog";
import prisma from "@/lib/prisma";

export default async function MetasPage() {
  const [total, activas, completadas] = await Promise.all([
    prisma.goal.count(),
    prisma.goal.count({ where: { isActive: true } }),
    prisma.goal.count({ where: { status: "COMPLETED" } }),
  ]);

  // Average progress (currentValue / targetValue)
  const goalsRaw = await prisma.goal.findMany({
    where: { isActive: true },
    include: { milestones: true },
    orderBy: { endDate: "asc" },
  });

  const { calculateGoalProgress } = await import("@/app/admin/actions");

  const goals = await Promise.all(
    goalsRaw.map(async (g) => {
      const current = await calculateGoalProgress(g as any);
      return {
        ...g,
        targetValue: g.targetValue.toNumber(),
        currentValue: current,
        trend: g.trend.toNumber(),
        milestones: g.milestones.map((m) => ({
          ...m,
          value: m.value.toNumber(),
        })),
      };
    })
  );

  const avgProgress =
    goals.length === 0
      ? 0
      : Math.round(
          goals.reduce((acc, g) => {
            const target = Number(g.targetValue);
            const current = Number(g.currentValue);
            return acc + (target === 0 ? 0 : Math.min(100, (current / target) * 100));
          }, 0) / goals.length
        );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas y Objetivos</h1>
          <p className="mt-2 text-muted-foreground">
            Seguimiento de objetivos comerciales en tiempo real desde pólizas y facturas.
          </p>
        </div>
        <NuevaMetaDialog />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Metas"
          value={total.toLocaleString("es-CO")}
          footerTitle="Todas las metas"
        />
        <SectionCard
          title="Metas Activas"
          value={activas.toLocaleString("es-CO")}
          trend="up"
          trendValue="isActive = true"
          footerTitle="En seguimiento"
        />
        <SectionCard
          title="Metas Logradas"
          value={completadas.toLocaleString("es-CO")}
          trend={completadas > 0 ? "up" : "down"}
          trendValue={completadas > 0 ? "¡Excelente trabajo!" : "Por completar"}
          footerTitle="Estado: ACHIEVED"
        />
        <SectionCard
          title="Progreso Promedio"
          value={`${avgProgress}%`}
          trend={avgProgress >= 70 ? "up" : "down"}
          trendValue={avgProgress >= 70 ? "Buen ritmo" : "Revisar objetivos"}
          footerTitle="Metas activas"
        />
      </div>

      {/* Goals List — Client Component con filtro por categoría */}
      <MetasList initialGoals={goals as any} />
    </div>
  );
}
