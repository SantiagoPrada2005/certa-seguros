"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FilterIcon } from "lucide-react";
import { fetchGoals, type GoalRecord } from "@/lib/api-client";
import { toast } from "sonner";

const categoryLabel: Record<string, string> = {
  VENTAS:       "Ventas",
  CLIENTES:     "Clientes",
  RENOVACIONES: "Renovaciones",
  INGRESOS:     "Ingresos",
};

const periodLabel: Record<string, string> = {
  MENSUAL:     "Mensual",
  TRIMESTRAL:  "Trimestral",
  ANUAL:       "Anual",
};

interface MetasListProps {
  initialGoals: GoalRecord[];
}

export function MetasList({ initialGoals }: MetasListProps) {
  const [goals, setGoals] = React.useState<GoalRecord[]>(initialGoals);
  const [category, setCategory] = React.useState("all");
  const [loading, setLoading] = React.useState(false);

  // Client-side filter by category
  const filtered = React.useMemo(() => {
    if (category === "all") return goals;
    return goals.filter((g) => g.category === category);
  }, [goals, category]);

  const getProgress = (g: GoalRecord) => {
    const target = Number(g.targetValue ?? 0);
    const current = Number(g.currentValue ?? 0);
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const getStatus = (percent: number) => {
    if (percent >= 100) return { label: "Completada", colorClass: "bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400" };
    if (percent >= 70) return { label: "En camino", colorClass: "" };
    if (percent >= 40) return { label: "En progreso", colorClass: "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400" };
    return { label: "En riesgo", colorClass: "bg-red-500/15 text-red-700 border-red-200 dark:text-red-400" };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} meta{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
        </p>
        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <FilterIcon data-icon="inline-start" className="size-4" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="VENTAS">Ventas</SelectItem>
            <SelectItem value="CLIENTES">Clientes</SelectItem>
            <SelectItem value="RENOVACIONES">Renovaciones</SelectItem>
            <SelectItem value="INGRESOS">Ingresos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals grid */}
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No hay metas para la categoría seleccionada.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((goal) => {
          const target = Number(goal.targetValue ?? 0);
          const current = Number(goal.currentValue ?? 0);
          const percent = target === 0 ? 0 : Math.min(100, Math.round((current / target) * 100));
          const statusInfo = getStatus(percent);

          return (
            <Card key={goal.id} className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-base">{goal.name}</h3>
                  {goal.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="secondary" className="text-[10px]">
                    {categoryLabel[goal.category] ?? goal.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {periodLabel[goal.period] ?? goal.period}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium tabular-nums">
                    {current.toLocaleString("es-CO")} / {target.toLocaleString("es-CO")} {goal.unit}
                  </span>
                </div>
                <Progress value={percent} className="h-2" />
                <div className="flex items-center justify-between">
                  <Badge className={statusInfo.colorClass} variant="outline">
                    {statusInfo.label}
                  </Badge>
                  <span className="text-sm font-semibold tabular-nums">{percent}%</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
