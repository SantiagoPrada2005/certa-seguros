import { getDashboardData } from "../actions";
import { DashboardKPIs } from "@/components/admin/dashboard/dashboard-kpis";
import { DashboardCharts } from "@/components/admin/dashboard/dashboard-charts";
import { DashboardTargets } from "@/components/admin/dashboard/dashboard-targets";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";

export default async function MetricsDashboardPage() {
  let data;
  try {
    data = await getDashboardData();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Métricas</h1>
          <p className="text-muted-foreground">
            Vista general del rendimiento del negocio y KPIs principales.
          </p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">Error al cargar los datos del dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">
            No se pudieron obtener los datos de la base de datos. Verifica la conexión e intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Métricas</h1>
        <p className="text-muted-foreground">
          Vista general del rendimiento del negocio y KPIs principales.
        </p>
      </div>

      <DashboardKPIs stats={data.stats} />
      <DashboardCharts
        revenueData={data.revenueData}
        serviceDistributionData={data.serviceDistributionData}
        leadSourcesData={data.leadSourcesData}
        conversionData={data.conversionData}
        weeklyActivityData={data.weeklyActivityData}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardTargets goals={data.goalsData} />
        <ActivityFeed feed={data.feed.map((f) => ({
          ...f,
          createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : String(f.createdAt),
        }))} />
      </div>
    </div>
  );
}
