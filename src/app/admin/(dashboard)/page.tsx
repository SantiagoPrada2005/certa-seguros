"use client"

import * as React from "react"
import { type GoalRecord } from "@/lib/api-client"
import { fetchDashboardStats, type DashboardStats } from "@/lib/api-client"
import { getDashboardChartData } from "../actions"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionCard } from "@/components/admin/section-card"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  DollarSignIcon,
  ShieldCheckIcon,
  ActivityIcon,
  CalendarIcon,
  TargetIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
} from "lucide-react"

// ═══════════════════════════════════════════════════
// DYNAMIC CHART DATA
// ═══════════════════════════════════════════════════

const revenueConfig = {
  primas: {
    label: "Primas",
    color: "var(--color-primary)",
  },
  comisiones: {
    label: "Comisiones",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig



const serviceConfig = {
  cantidad: { label: "Cantidad" },
  soat: { label: "SOAT", color: "var(--color-primary)" },
  vehicular: { label: "Vehicular", color: "var(--color-chart-2)" },
  vida: { label: "Vida", color: "var(--color-chart-3)" },
  arl: { label: "ARL", color: "var(--color-chart-4)" },
  todoriesgo: { label: "Todo Riesgo", color: "var(--color-chart-5)" },
} satisfies ChartConfig



const leadSourcesConfig = {
  valor: { label: "Leads" },
  "Web Pública": { label: "Web Pública", color: "var(--color-primary)" },
  Referidos: { label: "Referidos", color: "var(--color-chart-2)" },
  "Redes Sociales": { label: "Redes Sociales", color: "var(--color-chart-3)" },
  Directos: { label: "Directos", color: "var(--color-chart-4)" },
} satisfies ChartConfig



const conversionConfig = {
  valor: { label: "Tasa de Conversión" },
} satisfies ChartConfig



const weeklyConfig = {
  contactados: { label: "Contactados", color: "var(--color-primary)" },
  nuevos: { label: "Nuevos", color: "var(--color-chart-2)" },
  cerrados: { label: "Cerrados", color: "var(--color-chart-3)" },
} satisfies ChartConfig

const activityBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUCCESS: "default",
  INFO: "secondary",
  WARNING: "outline",
  ERROR: "destructive",
}

const formatCOP = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

const formatCOPCompact = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
};

const prospectStatusLabel: Record<string, string> = {
  NUEVO: "Nuevos",
  CONTACTADO: "Contactados",
  EN_PROCESO: "En Proceso",
  DESCARTADO: "Descartados",
  CONVERTIDO: "Convertidos",
};

export default function MetricsDashboardPage() {
  const [dashData, setDashData] = React.useState<DashboardStats | null>(null);
  const [chartData, setChartData] = React.useState<{
    revenueData: any[];
    serviceDistributionData: any[];
    leadSourcesData: any[];
    conversionData: any[];
    weeklyActivityData: any[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [targets, setTargets] = React.useState<GoalRecord[]>([]);

  React.useEffect(() => {
    Promise.all([
      fetchDashboardStats(6),
      getDashboardChartData(),
      fetch('/api/goals').then(res => res.json())
    ])
      .then(([dash, charts, goalsData]) => {
        setDashData(dash);
        setChartData(charts);
        setTargets(goalsData.filter((g: GoalRecord) => g.isActive).slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = dashData?.stats;
  const feed = dashData?.feed ?? [];
  const revenueData = chartData?.revenueData ?? [];
  const serviceDistributionData = chartData?.serviceDistributionData ?? [];
  const leadSourcesData = chartData?.leadSourcesData ?? [];
  const conversionData = chartData?.conversionData ?? [{ name: "Conversión", valor: 0, fill: "var(--color-primary)" }];
  const weeklyActivityData = chartData?.weeklyActivityData ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Métricas</h1>
        <p className="text-muted-foreground">
          Vista general del rendimiento del negocio y KPIs principales.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-5 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Ingresos del Mes"
          value={loading ? "…" : formatCOPCompact(stats?.monthlyRevenue ?? 0)}
          trend="up"
          trendValue="Facturas pagas"
          footerTitle="Mes actual"
        />
        <SectionCard
          title="Clientes Activos"
          value={loading ? "…" : (stats?.totalClients ?? 0).toLocaleString("es-CO")}
          trend="up"
          trendValue="Estado: ACTIVO"
          footerTitle="En base de datos"
        />
        <SectionCard
          title="Prospectos en Pipeline"
          value={loading ? "…" : (stats?.totalProspects ?? 0).toLocaleString("es-CO")}
          trend="up"
          trendValue="Activos (no descartados)"
          footerTitle={
            loading ? "…" : (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {stats?.prospectsBreakdown && Object.entries(stats.prospectsBreakdown).map(([status, count]) => (
                  <span key={status} className="text-muted-foreground">
                    {prospectStatusLabel[status] || status}: <strong className="text-foreground">{count}</strong>
                  </span>
                ))}
              </div>
            )
          }
        />
        <SectionCard
          title="Pólizas Activas"
          value={loading ? "…" : (stats?.activePolicies ?? 0).toLocaleString("es-CO")}
          trend="up"
          trendValue="Estado: ACTIVE"
          footerTitle="Vigentes actualmente"
        />
        <SectionCard
          title="Recordatorios Pendientes"
          value={loading ? "…" : (stats?.pendingReminders ?? 0).toLocaleString("es-CO")}
          trend="down"
          trendValue="Por atender"
          footerTitle="Estado: PENDIENTE"
        />
      </div>

      {/* Revenue Chart + Service Distribution */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
        {/* Revenue Area Chart - Wide */}
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Evolución de Ingresos</CardTitle>
            <CardDescription>
              Primas y comisiones mensuales — Año 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[300px] w-full">
              <AreaChart
                accessibilityLayer
                data={revenueData}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => formatCOP(v)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCOP(value as number)}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <defs>
                  <linearGradient id="fillPrimas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primas)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primas)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillComisiones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-comisiones)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-comisiones)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="primas"
                  type="natural"
                  fill="url(#fillPrimas)"
                  stroke="var(--color-primas)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="comisiones"
                  type="natural"
                  fill="url(#fillComisiones)"
                  stroke="var(--color-comisiones)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUpIcon className="size-4 text-primary" />
              <span className="font-medium">+18.2% crecimiento</span>
              <span className="text-muted-foreground">respecto al periodo anterior</span>
            </div>
          </CardFooter>
        </Card>

        {/* Service Distribution Bar Chart */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Distribución por Servicio</CardTitle>
            <CardDescription>
              Pólizas activas por tipo de servicio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={serviceConfig} className="h-[300px] w-full">
              <BarChart
                accessibilityLayer
                data={serviceDistributionData}
                layout="vertical"
                margin={{ left: 0, right: 12 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <YAxis
                  dataKey="servicio"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={80}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
                  {serviceDistributionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheckIcon className="size-4 text-primary" />
              <span className="font-medium">1,077 pólizas</span>
              <span className="text-muted-foreground">distribuidas en 5 categorías</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Second Row: Lead Sources + Conversion + Weekly */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Lead Sources Pie Chart */}
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Origen de Leads</CardTitle>
            <CardDescription>
              Canales de captación de prospectos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={leadSourcesConfig} className="mx-auto h-[268px] w-full max-w-[280px]">
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="fuente" hideLabel />}
                />
                <Pie
                  data={leadSourcesData}
                  dataKey="valor"
                  nameKey="fuente"
                  innerRadius={55}
                  outerRadius={90}
                  strokeWidth={3}
                  stroke="var(--color-background)"
                >
                  {leadSourcesData.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex flex-col gap-2 w-full">
              {leadSourcesData.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-muted-foreground">{item.fuente}</span>
                  </div>
                  <span className="font-medium tabular-nums">{item.valor}%</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>

        {/* Weekly Activity Line Chart */}
        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Actividad Semanal</CardTitle>
            <CardDescription>
              Gestión de prospectos esta semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyConfig} className="h-[268px] w-full">
              <LineChart
                accessibilityLayer
                data={weeklyActivityData}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="dia"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="contactados"
                  stroke="var(--color-contactados)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="nuevos"
                  stroke="var(--color-nuevos)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="cerrados"
                  stroke="var(--color-cerrados)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <ActivityIcon className="size-4 text-primary" />
              <span className="font-medium">180 gestiones</span>
              <span className="text-muted-foreground">completadas esta semana</span>
            </div>
          </CardFooter>
        </Card>

        {/* Conversion Rate Radial + Stats */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Tasa de Conversión</CardTitle>
            <CardDescription>
              Prospectos → Clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ChartContainer config={conversionConfig} className="mx-auto h-[240px] w-full max-w-[200px]">
              <RadialBarChart
                data={conversionData}
                startAngle={180}
                endAngle={180 - (180 * 2 * (conversionData[0]?.valor / 100 || 0))}
                innerRadius={60}
                outerRadius={90}
              >
                <RadialBar
                  dataKey="valor"
                  background
                  cornerRadius={10}
                  className="[&_.recharts-radial-bar-background-sector]:fill-muted"
                />
              </RadialBarChart>
            </ChartContainer>
            <div className="text-center -mt-10">
              <p className="text-3xl font-bold tabular-nums">{Math.round(conversionData[0]?.valor || 0)}%</p>
              <p className="text-xs text-muted-foreground">
                Meta trimestral: 75%
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mes actual</span>
                <div className="flex items-center gap-1">
                  <ArrowUpRightIcon className="size-3.5 text-primary" />
                  <span className="font-medium text-primary">+3.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trimestre</span>
                <div className="flex items-center gap-1">
                  <ArrowUpRightIcon className="size-3.5 text-primary" />
                  <span className="font-medium text-primary">+7.8%</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Third Row: Targets + Recent Activity */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Targets Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="size-5" />
              Metas del Trimestre
            </CardTitle>
            <CardDescription>
              Progreso hacia los objetivos Q4 – 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {targets.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No hay metas activas registradas.</p>
              )}
              {targets.map((target, i) => {
                const percentage = Number(target.targetValue) === 0 ? 0 : Math.round((Number(target.currentValue) / Number(target.targetValue)) * 100)
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{target.name}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {Number(target.currentValue).toLocaleString("es-CO")} / {Number(target.targetValue).toLocaleString("es-CO")} {target.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm font-semibold tabular-nums w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Quedan <strong className="text-foreground">42 días</strong> para cerrar el trimestre
              </span>
            </div>
          </CardFooter>
        </Card>

        {/* Real Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="size-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas acciones registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {loading && (
                <p className="text-sm text-muted-foreground text-center py-4">Cargando…</p>
              )}
              {!loading && feed.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hay actividad registrada aún.</p>
              )}
              {feed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="mt-0.5">
                    <Badge variant={activityBadgeVariant[item.type] ?? "secondary"} className="text-[10px] px-1.5 leading-none">
                      {item.type === "SUCCESS" ? "✓" : item.type === "INFO" ? "→" : item.type === "WARNING" ? "!" : "✕"}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.action}</span>
                    {item.client && (
                      <span className="text-xs text-muted-foreground">{item.client.name}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {relativeTime(item.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Datos en tiempo real de la base de datos</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
