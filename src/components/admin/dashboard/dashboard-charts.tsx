"use client";

import * as React from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, RadialBar, RadialBarChart, XAxis, YAxis,
} from "recharts";
import {
  ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { TrendingUpIcon, ShieldCheckIcon, ActivityIcon } from "lucide-react";
import { formatCOP } from "@/lib/format";

const revenueConfig = {
  primas: { label: "Primas", color: "var(--color-primary)" },
  comisiones: { label: "Comisiones", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

const serviceConfig = {
  cantidad: { label: "Cantidad" },
} satisfies ChartConfig;

const leadSourcesConfig = {
  valor: { label: "Leads" },
} satisfies ChartConfig;

const conversionConfig = {
  valor: { label: "Tasa de Conversión" },
} satisfies ChartConfig;

const weeklyConfig = {
  nuevos: { label: "Nuevos", color: "var(--color-primary)" },
  gestiones: { label: "Gestiones", color: "var(--color-chart-2)" },
  cerrados: { label: "Cerrados", color: "var(--color-chart-3)" },
} satisfies ChartConfig;

interface DashboardChartsProps {
  revenueData: { month: string; primas: number; comisiones: number }[];
  serviceDistributionData: { servicio: string; cantidad: number; fill: string }[];
  leadSourcesData: { fuente: string; valor: number; fill: string }[];
  conversionData: { name: string; valor: number; fill: string }[];
  weeklyActivityData: { dia: string; nuevos: number; gestiones: number; cerrados: number }[];
}

export function DashboardCharts({
  revenueData,
  serviceDistributionData,
  leadSourcesData,
  conversionData,
  weeklyActivityData,
}: DashboardChartsProps) {
  const currentYear = new Date().getFullYear();

  const totalPolicies = serviceDistributionData.reduce((s, d) => s + d.cantidad, 0);
  const totalGestiones = weeklyActivityData.reduce((s, d) => s + d.nuevos + d.gestiones + d.cerrados, 0);
  const totalLeads = leadSourcesData.reduce((s, d) => s + d.valor, 0);

  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthName = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][prevMonth.getMonth()];
  const currentMonthData = revenueData.length > 1 ? revenueData[revenueData.length - 1] : null;
  const prevMonthData = revenueData.length > 1 ? revenueData[revenueData.length - 2] : null;
  let growthText = "Sin datos del periodo anterior";
  if (currentMonthData && prevMonthData && prevMonthData.primas > 0) {
    const growth = ((currentMonthData.primas - prevMonthData.primas) / prevMonthData.primas * 100);
    const sign = growth >= 0 ? "+" : "";
    growthText = `${sign}${growth.toFixed(1)}% crecimiento vs. ${prevMonthName}`;
  }

  const leadSourcesWithPercent = leadSourcesData.map((item) => ({
    ...item,
    percent: totalLeads > 0 ? Math.round((item.valor / totalLeads) * 100) : 0,
  }));

  const chartCardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <motion.div variants={chartCardVariants}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
          <Card className="transition-shadow hover:shadow-md xl:col-span-4">
          <CardHeader>
            <CardTitle>Evolución de Ingresos</CardTitle>
            <CardDescription>Primas y comisiones mensuales — Año {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[300px] w-full">
              <AreaChart accessibilityLayer data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => formatCOP(v)} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCOP(value as number)} />} />
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
                <Area dataKey="primas" type="natural" fill="url(#fillPrimas)" stroke="var(--color-primas)" strokeWidth={2} />
                <Area dataKey="comisiones" type="natural" fill="url(#fillComisiones)" stroke="var(--color-comisiones)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUpIcon className="size-4 text-primary" />
              <span className="font-medium">{growthText}</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Distribución por Servicio</CardTitle>
            <CardDescription>Pólizas activas por tipo de servicio</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={serviceConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={serviceDistributionData} layout="vertical" margin={{ left: 0, right: 12 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <YAxis dataKey="servicio" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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
              <span className="font-medium">{totalPolicies.toLocaleString("es-CO")} pólizas</span>
              <span className="text-muted-foreground">distribuidas en {serviceDistributionData.length} categorías</span>
            </div>
          </CardFooter>
        </Card>
      </div>
      </motion.div>

      <motion.div variants={chartCardVariants}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12">
        <Card className="transition-shadow hover:shadow-md xl:col-span-4 md:col-span-1">
          <CardHeader>
            <CardTitle>Origen de Leads</CardTitle>
            <CardDescription>Canales de captación de prospectos</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={leadSourcesConfig} className="mx-auto h-[268px] w-full max-w-[280px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="fuente" hideLabel />} />
                <Pie data={leadSourcesWithPercent} dataKey="valor" nameKey="fuente" innerRadius={55} outerRadius={90} strokeWidth={3} stroke="var(--color-background)">
                  {leadSourcesWithPercent.map((_, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex flex-col gap-2 w-full">
              {leadSourcesWithPercent.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.fuente}</span>
                  </div>
                  <span className="font-medium tabular-nums">{item.percent}%</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Actividad Semanal</CardTitle>
            <CardDescription>Gestión de prospectos esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyConfig} className="h-[268px] w-full">
              <LineChart accessibilityLayer data={weeklyActivityData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="nuevos" stroke="var(--color-nuevos)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="gestiones" stroke="var(--color-gestiones)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="cerrados" stroke="var(--color-cerrados)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <ActivityIcon className="size-4 text-primary" />
              <span className="font-medium">{totalGestiones.toLocaleString("es-CO")} gestiones</span>
              <span className="text-muted-foreground">completadas esta semana</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="transition-shadow hover:shadow-md xl:col-span-3 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Tasa de Conversión</CardTitle>
            <CardDescription>Prospectos → Clientes</CardDescription>
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
                <RadialBar dataKey="valor" background cornerRadius={10} className="[&_.recharts-radial-bar-background-sector]:fill-muted" />
              </RadialBarChart>
            </ChartContainer>
            <div className="text-center -mt-10">
              <p className="text-3xl font-bold tabular-nums">{Math.round(conversionData[0]?.valor || 0)}%</p>
              <p className="text-xs text-muted-foreground">Prospectos convertidos a clientes</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </motion.div>
    </motion.div>
  );
}
