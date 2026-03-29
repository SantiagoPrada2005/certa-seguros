"use client"

import * as React from "react"
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
// MOCK DATA - Optimized for an Insurance CRM Dashboard
// ═══════════════════════════════════════════════════

const revenueData = [
  { month: "Ene", primas: 12400000, comisiones: 2480000 },
  { month: "Feb", primas: 14200000, comisiones: 2840000 },
  { month: "Mar", primas: 11800000, comisiones: 2360000 },
  { month: "Abr", primas: 16700000, comisiones: 3340000 },
  { month: "May", primas: 15300000, comisiones: 3060000 },
  { month: "Jun", primas: 18900000, comisiones: 3780000 },
  { month: "Jul", primas: 17100000, comisiones: 3420000 },
  { month: "Ago", primas: 19500000, comisiones: 3900000 },
  { month: "Sep", primas: 21200000, comisiones: 4240000 },
  { month: "Oct", primas: 20100000, comisiones: 4020000 },
  { month: "Nov", primas: 22800000, comisiones: 4560000 },
  { month: "Dic", primas: 24500000, comisiones: 4900000 },
]

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

const serviceDistributionData = [
  { servicio: "SOAT", cantidad: 342, fill: "var(--color-soat)" },
  { servicio: "Vehicular", cantidad: 287, fill: "var(--color-vehicular)" },
  { servicio: "Vida", cantidad: 196, fill: "var(--color-vida)" },
  { servicio: "ARL", cantidad: 154, fill: "var(--color-arl)" },
  { servicio: "Todo Riesgo", cantidad: 98, fill: "var(--color-todoriesgo)" },
]

const serviceConfig = {
  cantidad: { label: "Cantidad" },
  soat: { label: "SOAT", color: "var(--color-primary)" },
  vehicular: { label: "Vehicular", color: "var(--color-chart-2)" },
  vida: { label: "Vida", color: "var(--color-chart-3)" },
  arl: { label: "ARL", color: "var(--color-chart-4)" },
  todoriesgo: { label: "Todo Riesgo", color: "var(--color-chart-5)" },
} satisfies ChartConfig

const leadSourcesData = [
  { fuente: "Web Pública", valor: 45, fill: "var(--color-primary)" },
  { fuente: "Referidos", valor: 28, fill: "var(--color-chart-2)" },
  { fuente: "Redes Sociales", valor: 15, fill: "var(--color-chart-3)" },
  { fuente: "Directos", valor: 12, fill: "var(--color-chart-4)" },
]

const leadSourcesConfig = {
  valor: { label: "Leads" },
  "Web Pública": { label: "Web Pública", color: "var(--color-primary)" },
  Referidos: { label: "Referidos", color: "var(--color-chart-2)" },
  "Redes Sociales": { label: "Redes Sociales", color: "var(--color-chart-3)" },
  Directos: { label: "Directos", color: "var(--color-chart-4)" },
} satisfies ChartConfig

const conversionData = [
  { name: "Conversión", valor: 73, fill: "var(--color-primary)" },
]

const conversionConfig = {
  valor: { label: "Tasa de Conversión" },
} satisfies ChartConfig

const weeklyActivityData = [
  { dia: "Lun", contactados: 24, nuevos: 12, cerrados: 8 },
  { dia: "Mar", contactados: 31, nuevos: 18, cerrados: 11 },
  { dia: "Mié", contactados: 28, nuevos: 14, cerrados: 9 },
  { dia: "Jue", contactados: 35, nuevos: 21, cerrados: 14 },
  { dia: "Vie", contactados: 42, nuevos: 25, cerrados: 17 },
  { dia: "Sáb", contactados: 15, nuevos: 8, cerrados: 5 },
  { dia: "Dom", contactados: 5, nuevos: 3, cerrados: 1 },
]

const weeklyConfig = {
  contactados: { label: "Contactados", color: "var(--color-primary)" },
  nuevos: { label: "Nuevos", color: "var(--color-chart-2)" },
  cerrados: { label: "Cerrados", color: "var(--color-chart-3)" },
} satisfies ChartConfig

const targets = [
  { name: "Pólizas Emitidas", current: 847, goal: 1000, unit: "pólizas" },
  { name: "Primas Recaudadas", current: 214.5, goal: 280, unit: "M COP" },
  { name: "Clientes Nuevos", current: 156, goal: 200, unit: "clientes" },
  { name: "Renovaciones", current: 312, goal: 350, unit: "renovaciones" },
]

const recentActivity = [
  { action: "Nueva póliza SOAT emitida", client: "Transportes Andinos S.A.", time: "Hace 12 min", type: "success" as const },
  { action: "Prospecto contactado", client: "María Fernanda Lopez", time: "Hace 34 min", type: "info" as const },
  { action: "Renovación pendiente", client: "Constructora Horizonte", time: "Hace 1h", type: "warning" as const },
  { action: "Cotización enviada", client: "Logística Express", time: "Hace 2h", type: "info" as const },
  { action: "Pago recibido", client: "Ferretería El Roble", time: "Hace 3h", type: "success" as const },
  { action: "Siniestro reportado", client: "Distribuidora Nacional", time: "Hace 4h", type: "danger" as const },
]

const activityBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  info: "secondary",
  warning: "outline",
  danger: "destructive",
}

const formatCOP = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

export default function MetricsDashboardPage() {
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
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Primas del Mes"
          value="$24.5M"
          trend="up"
          trendValue="+18.2%"
          footerTitle="vs. mes anterior"
        />
        <SectionCard
          title="Total Clientes"
          value="1,847"
          trend="up"
          trendValue="+8.4%"
          footerTitle="Activos este trimestre"
        />
        <SectionCard
          title="Pólizas Activas"
          value="2,156"
          trend="up"
          trendValue="+12%"
          footerTitle="Crecimiento constante"
        />
        <SectionCard
          title="Tasa de Renovación"
          value="87.3%"
          trend="down"
          trendValue="-1.2%"
          footerTitle="Meta: 90%"
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
                  {serviceDistributionData.map((entry, index) => (
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
            <ChartContainer config={leadSourcesConfig} className="mx-auto h-[220px] w-full max-w-[280px]">
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
                  {leadSourcesData.map((_, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex flex-col gap-2 w-full">
              {leadSourcesData.map((item, i) => (
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
            <ChartContainer config={weeklyConfig} className="h-[220px] w-full">
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
            <ChartContainer config={conversionConfig} className="mx-auto h-[160px] w-full max-w-[200px]">
              <RadialBarChart
                data={conversionData}
                startAngle={180}
                endAngle={180 - (180 * 2 * 0.73)}
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
              <p className="text-3xl font-bold tabular-nums">73%</p>
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
              {targets.map((target, i) => {
                const percentage = Math.round((target.current / target.goal) * 100)
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{target.name}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {target.current} / {target.goal} {target.unit}
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

        {/* Recent Activity Feed */}
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
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="mt-0.5">
                    <Badge variant={activityBadgeVariant[item.type]} className="text-[10px] px-1.5 leading-none">
                      {item.type === "success" ? "✓" :
                       item.type === "info" ? "→" :
                       item.type === "warning" ? "!" : "✕"}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.action}</span>
                    <span className="text-xs text-muted-foreground">{item.client}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Actualizado automáticamente</span>
              <span>·</span>
              <span className="font-medium text-foreground">Hoy, 10:45 AM</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
