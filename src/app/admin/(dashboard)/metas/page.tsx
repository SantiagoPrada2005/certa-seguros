"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { SectionCard } from "@/components/admin/section-card"
import {
  TargetIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PlusIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ShieldCheckIcon,
  UsersIcon,
  DollarSignIcon,
  RepeatIcon,
  InfoIcon,
  FlagIcon,
  ZapIcon,
  AwardIcon,
  ChevronRightIcon,
} from "lucide-react"

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

type GoalStatus = "on_track" | "at_risk" | "behind" | "completed" | "exceeded"
type GoalCategory = "ventas" | "clientes" | "renovaciones" | "ingresos"
type GoalPeriod = "mensual" | "trimestral" | "anual"

interface Goal {
  id: string
  name: string
  description: string
  category: GoalCategory
  period: GoalPeriod
  current: number
  target: number
  unit: string
  status: GoalStatus
  trend: number
  startDate: string
  endDate: string
  milestones: { label: string; value: number; reached: boolean }[]
  isActive: boolean
}

// ═══════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════

const goals: Goal[] = [
  {
    id: "g1",
    name: "Pólizas SOAT Emitidas",
    description: "Emisión de pólizas SOAT a nivel nacional para el trimestre",
    category: "ventas",
    period: "trimestral",
    current: 342,
    target: 400,
    unit: "pólizas",
    status: "on_track",
    trend: 12.5,
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    milestones: [
      { label: "25%", value: 100, reached: true },
      { label: "50%", value: 200, reached: true },
      { label: "75%", value: 300, reached: true },
      { label: "100%", value: 400, reached: false },
    ],
    isActive: true,
  },
  {
    id: "g2",
    name: "Primas Recaudadas",
    description: "Total de primas cobradas a clientes activos del portafolio",
    category: "ingresos",
    period: "trimestral",
    current: 214500000,
    target: 280000000,
    unit: "COP",
    status: "at_risk",
    trend: -2.3,
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    milestones: [
      { label: "25%", value: 70000000, reached: true },
      { label: "50%", value: 140000000, reached: true },
      { label: "75%", value: 210000000, reached: true },
      { label: "100%", value: 280000000, reached: false },
    ],
    isActive: true,
  },
  {
    id: "g3",
    name: "Clientes Nuevos",
    description: "Captación de nuevos clientes a través de todos los canales",
    category: "clientes",
    period: "trimestral",
    current: 156,
    target: 200,
    unit: "clientes",
    status: "on_track",
    trend: 8.4,
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    milestones: [
      { label: "25%", value: 50, reached: true },
      { label: "50%", value: 100, reached: true },
      { label: "75%", value: 150, reached: true },
      { label: "100%", value: 200, reached: false },
    ],
    isActive: true,
  },
  {
    id: "g4",
    name: "Renovaciones de Pólizas",
    description: "Renovaciones exitosas de pólizas que vencen en el periodo",
    category: "renovaciones",
    period: "trimestral",
    current: 312,
    target: 350,
    unit: "renovaciones",
    status: "on_track",
    trend: 5.1,
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    milestones: [
      { label: "25%", value: 88, reached: true },
      { label: "50%", value: 175, reached: true },
      { label: "75%", value: 263, reached: true },
      { label: "100%", value: 350, reached: false },
    ],
    isActive: true,
  },
  {
    id: "g5",
    name: "Pólizas Vehiculares",
    description: "Emisión de seguros todo riesgo y parcial para vehículos",
    category: "ventas",
    period: "trimestral",
    current: 287,
    target: 300,
    unit: "pólizas",
    status: "on_track",
    trend: 15.2,
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    milestones: [
      { label: "25%", value: 75, reached: true },
      { label: "50%", value: 150, reached: true },
      { label: "75%", value: 225, reached: true },
      { label: "100%", value: 300, reached: false },
    ],
    isActive: true,
  },
  {
    id: "g6",
    name: "Comisiones Generadas",
    description: "Ingreso total por comisiones de intermediación de seguros",
    category: "ingresos",
    period: "mensual",
    current: 4900000,
    target: 5500000,
    unit: "COP",
    status: "on_track",
    trend: 4.8,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    milestones: [
      { label: "25%", value: 1375000, reached: true },
      { label: "50%", value: 2750000, reached: true },
      { label: "75%", value: 4125000, reached: true },
      { label: "100%", value: 5500000, reached: false },
    ],
    isActive: true,
  },
  {
    id: "g7",
    name: "Pólizas de Vida",
    description: "Emisión de seguros de vida, individuales y colectivos",
    category: "ventas",
    period: "anual",
    current: 196,
    target: 250,
    unit: "pólizas",
    status: "at_risk",
    trend: -1.4,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    milestones: [
      { label: "25%", value: 63, reached: true },
      { label: "50%", value: 125, reached: true },
      { label: "75%", value: 188, reached: true },
      { label: "100%", value: 250, reached: false },
    ],
    isActive: true,
  },
  {
    id: "g8",
    name: "Tasa de Conversión",
    description: "Porcentaje de prospectos convertidos en clientes activos",
    category: "clientes",
    period: "mensual",
    current: 73,
    target: 80,
    unit: "%",
    status: "behind",
    trend: -3.2,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    milestones: [
      { label: "60%", value: 60, reached: true },
      { label: "70%", value: 70, reached: true },
      { label: "75%", value: 75, reached: false },
      { label: "80%", value: 80, reached: false },
    ],
    isActive: true,
  },
]

// ═══════════════════════════════════════════════════
// CONFIG & HELPERS
// ═══════════════════════════════════════════════════

const statusConfig: Record<GoalStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  on_track: { label: "En Camino", variant: "default", icon: <TrendingUpIcon className="size-3" /> },
  at_risk: { label: "En Riesgo", variant: "outline", icon: <AlertTriangleIcon className="size-3" /> },
  behind: { label: "Rezagada", variant: "destructive", icon: <TrendingDownIcon className="size-3" /> },
  completed: { label: "Completada", variant: "default", icon: <CheckCircle2Icon className="size-3" /> },
  exceeded: { label: "Superada", variant: "default", icon: <ZapIcon className="size-3" /> },
}

const categoryConfig: Record<GoalCategory, { label: string; icon: React.ReactNode; color: string }> = {
  ventas: { label: "Ventas", icon: <ShieldCheckIcon className="size-4" />, color: "var(--color-primary)" },
  clientes: { label: "Clientes", icon: <UsersIcon className="size-4" />, color: "var(--color-chart-2)" },
  renovaciones: { label: "Renovaciones", icon: <RepeatIcon className="size-4" />, color: "var(--color-chart-3)" },
  ingresos: { label: "Ingresos", icon: <DollarSignIcon className="size-4" />, color: "var(--color-chart-4)" },
}

const periodLabels: Record<GoalPeriod, string> = {
  mensual: "Mensual",
  trimestral: "Trimestral",
  anual: "Anual",
}

const formatValue = (value: number, unit: string) => {
  if (unit === "COP") {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }
  if (unit === "%") return `${value}%`
  return value.toLocaleString()
}

const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date("2024-12-15") // mock "today"
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

const getGoalPercentage = (goal: Goal) => Math.min(100, Math.round((goal.current / goal.target) * 100))

// Chart configs
const categoryChartConfig = {
  ventas: { label: "Ventas", color: "var(--color-primary)" },
  clientes: { label: "Clientes", color: "var(--color-chart-2)" },
  renovaciones: { label: "Renovaciones", color: "var(--color-chart-3)" },
  ingresos: { label: "Ingresos", color: "var(--color-chart-4)" },
} satisfies ChartConfig

const radialConfig = {
  progreso: { label: "Progreso" },
} satisfies ChartConfig

// ═══════════════════════════════════════════════════
// SUMMARY CALCULATIONS
// ═══════════════════════════════════════════════════

const totalGoals = goals.length
const onTrackGoals = goals.filter((g) => g.status === "on_track" || g.status === "completed" || g.status === "exceeded").length
const atRiskGoals = goals.filter((g) => g.status === "at_risk").length
const behindGoals = goals.filter((g) => g.status === "behind").length
const avgCompletion = Math.round(goals.reduce((sum, g) => sum + getGoalPercentage(g), 0) / totalGoals)

// Category breakdown for chart
const categoryBreakdown = Object.entries(categoryConfig).map(([key, config]) => {
  const categoryGoals = goals.filter((g) => g.category === key)
  const avgProgress = categoryGoals.length
    ? Math.round(categoryGoals.reduce((sum, g) => sum + getGoalPercentage(g), 0) / categoryGoals.length)
    : 0
  return {
    category: config.label,
    progreso: avgProgress,
    fill: config.color,
  }
})

// ═══════════════════════════════════════════════════
// COMPONENT: GoalCard
// ═══════════════════════════════════════════════════

function GoalCard({ goal }: { goal: Goal }) {
  const pct = getGoalPercentage(goal)
  const days = getDaysRemaining(goal.endDate)
  const statusInfo = statusConfig[goal.status]
  const catInfo = categoryConfig[goal.category]

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `color-mix(in oklch, ${catInfo.color}, transparent 85%)` }}
            >
              <div style={{ color: catInfo.color }}>{catInfo.icon}</div>
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-sm font-semibold leading-tight">{goal.name}</CardTitle>
              <CardDescription className="leading-tight">{goal.description}</CardDescription>
            </div>
          </div>
          <Badge variant={statusInfo.variant} className="shrink-0 gap-1 text-[10px]">
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {/* Progress Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold tabular-nums">{formatValue(goal.current, goal.unit)}</p>
              <p className="text-xs text-muted-foreground">
                de {formatValue(goal.target, goal.unit)} {goal.unit !== "%" && goal.unit !== "COP" ? goal.unit : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums">{pct}%</p>
              <div className="flex items-center gap-1 text-xs">
                {goal.trend > 0 ? (
                  <ArrowUpRightIcon className="size-3 text-primary" />
                ) : (
                  <ArrowDownRightIcon className="size-3 text-destructive" />
                )}
                <span className={goal.trend > 0 ? "text-primary font-medium" : "text-destructive font-medium"}>
                  {goal.trend > 0 ? "+" : ""}{goal.trend}%
                </span>
              </div>
            </div>
          </div>

          <Progress value={pct} className="h-2.5" />

          {/* Milestones */}
          <div className="flex items-center justify-between">
            {goal.milestones.map((m, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`size-2.5 rounded-full transition-colors ${
                          m.reached
                            ? "bg-primary"
                            : "bg-muted border border-border"
                        }`}
                      />
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {m.label}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatValue(m.value, goal.unit)} — {m.reached ? "Alcanzado ✓" : "Pendiente"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 leading-none">{periodLabels[goal.period]}</Badge>
            <span>·</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 leading-none">{catInfo.label}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="size-3" />
            <span className="tabular-nums font-medium text-foreground">{days} días</span>
            <span>restantes</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

// ═══════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════

export default function MetasPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

  const filteredGoals = selectedCategory === "all"
    ? goals
    : goals.filter((g) => g.category === selectedCategory)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
          <p className="text-muted-foreground mt-2">
            Establece, monitorea y alcanza los objetivos de negocio del periodo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger render={<Button />}>
              <PlusIcon data-icon="inline-start" />
              Nueva Meta
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Meta</DialogTitle>
                <DialogDescription>
                  Define un objetivo medible para el equipo. Podrás hacer seguimiento del progreso en tiempo real.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel htmlFor="goal-name">Nombre de la Meta</FieldLabel>
                  <Input id="goal-name" placeholder="Ej. Pólizas SOAT Emitidas" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="goal-desc">Descripción</FieldLabel>
                  <Input id="goal-desc" placeholder="Breve descripción del objetivo" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="goal-category">Categoría</FieldLabel>
                    <Select>
                      <SelectTrigger id="goal-category">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="clientes">Clientes</SelectItem>
                        <SelectItem value="renovaciones">Renovaciones</SelectItem>
                        <SelectItem value="ingresos">Ingresos</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="goal-period">Periodo</FieldLabel>
                    <Select>
                      <SelectTrigger id="goal-period">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="goal-target">Valor Objetivo</FieldLabel>
                    <Input id="goal-target" type="number" placeholder="Ej. 400" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="goal-unit">Unidad</FieldLabel>
                    <Select>
                      <SelectTrigger id="goal-unit">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="polizas">Pólizas</SelectItem>
                        <SelectItem value="clientes">Clientes</SelectItem>
                        <SelectItem value="renovaciones">Renovaciones</SelectItem>
                        <SelectItem value="COP">COP ($)</SelectItem>
                        <SelectItem value="%">Porcentaje (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="goal-start">Fecha Inicio</FieldLabel>
                    <Input id="goal-start" type="date" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="goal-end">Fecha Fin</FieldLabel>
                    <Input id="goal-end" type="date" />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter>
                <Button type="submit">Crear Meta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Metas Activas"
          value={totalGoals.toString()}
          footerTitle={`${onTrackGoals} en camino`}
          footerDescription="hacia los objetivos"
        />
        <SectionCard
          title="Progreso Promedio"
          value={`${avgCompletion}%`}
          trend="up"
          trendValue="+6.3%"
          footerTitle="Buen ritmo general"
        />
        <SectionCard
          title="Metas en Riesgo"
          value={atRiskGoals.toString()}
          trend="down"
          trendValue={`${atRiskGoals} alertas`}
          footerTitle="Requieren atención"
        />
        <SectionCard
          title="Metas Rezagadas"
          value={behindGoals.toString()}
          trend="down"
          trendValue="Acción inmediata"
          footerTitle="Bajo el umbral esperado"
        />
      </div>

      {/* Category Performance Chart + Radial Overview */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Horizontal bar: Average progress by category */}
        <Card className="xl:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlagIcon className="size-5" />
              Progreso por Categoría
            </CardTitle>
            <CardDescription>
              Promedio de avance de metas agrupadas por área de negocio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className="h-[240px] w-full">
              <BarChart
                accessibilityLayer
                data={categoryBreakdown}
                layout="vertical"
                margin={{ left: 0, right: 16 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={100}
                />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
                />
                <Bar dataKey="progreso" radius={[0, 6, 6, 0]} barSize={28}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex w-full items-center justify-between">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const catGoals = goals.filter((g) => g.category === key)
                return (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="text-muted-foreground">{config.label}</span>
                    <span className="font-medium tabular-nums">{catGoals.length}</span>
                  </div>
                )
              })}
            </div>
          </CardFooter>
        </Card>

        {/* Radial overall progress */}
        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AwardIcon className="size-5" />
              Salud General
            </CardTitle>
            <CardDescription>
              Visión consolidada del rendimiento trimestral
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <ChartContainer config={radialConfig} className="mx-auto h-[180px] w-full max-w-[220px]">
              <RadialBarChart
                data={[{ progreso: avgCompletion, fill: "var(--color-primary)" }]}
                startAngle={180}
                endAngle={180 - (180 * 2 * (avgCompletion / 100))}
                innerRadius={65}
                outerRadius={95}
              >
                <RadialBar
                  dataKey="progreso"
                  background
                  cornerRadius={12}
                  className="[&_.recharts-radial-bar-background-sector]:fill-muted"
                />
              </RadialBarChart>
            </ChartContainer>
            <div className="text-center -mt-8">
              <p className="text-4xl font-bold tabular-nums">{avgCompletion}%</p>
              <p className="text-sm text-muted-foreground">progreso global</p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="grid w-full grid-cols-3 gap-4 text-center">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2Icon className="size-3.5 text-primary" />
                  <span className="text-lg font-bold tabular-nums">{onTrackGoals}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">En camino</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangleIcon className="size-3.5 text-muted-foreground" />
                  <span className="text-lg font-bold tabular-nums">{atRiskGoals}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">En riesgo</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-center gap-1">
                  <TrendingDownIcon className="size-3.5 text-destructive" />
                  <span className="text-lg font-bold tabular-nums">{behindGoals}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Rezagadas</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Tabs: Filter goals by category */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Detalle de Metas</h2>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="ventas">Ventas</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
              <TabsTrigger value="renovaciones">Renovaciones</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>

        {filteredGoals.length === 0 && (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <TargetIcon className="size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No hay metas en esta categoría.
              </p>
              <Button variant="outline" size="sm">
                <PlusIcon data-icon="inline-start" />
                Crear primera meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline / Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="size-5" />
            Próximos Vencimientos
          </CardTitle>
          <CardDescription>
            Metas que se acercan a su fecha límite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {goals
              .sort((a, b) => getDaysRemaining(a.endDate) - getDaysRemaining(b.endDate))
              .slice(0, 5)
              .map((goal) => {
                const pct = getGoalPercentage(goal)
                const days = getDaysRemaining(goal.endDate)
                const urgency = days <= 7 ? "destructive" as const : days <= 30 ? "outline" as const : "secondary" as const

                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-4 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="shrink-0">
                      <Badge variant={urgency} className="tabular-nums text-xs">
                        {days}d
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{goal.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                          {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-bold tabular-nums">{pct}%</span>
                    </div>
                    <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
                  </div>
                )
              })}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="size-4" />
            <span>
              Próximo cierre crítico: <strong className="text-foreground">16 días</strong> — Pólizas SOAT y Primas Recaudadas
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
