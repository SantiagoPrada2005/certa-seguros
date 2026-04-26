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
      <div className="flex flex-col gap-6 animate-[fadeSlideIn_0.5s_ease-out]">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Métricas</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Vista general del rendimiento del negocio y KPIs principales.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-destructive font-medium">Error al cargar los datos del dashboard</p>
            <p className="text-sm text-muted-foreground mt-1">
              No se pudieron obtener los datos de la base de datos. Verifica la conexión e intenta nuevamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-[fadeSlideIn_0.5s_ease-out]">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Métricas</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardTargets goals={data.goalsData} />
        <ActivityFeed feed={data.feed.map((f) => ({
          ...f,
          createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : String(f.createdAt),
        }))} />
      </div>
    </div>
  );
}
