"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TargetIcon, CalendarIcon } from "lucide-react";

interface DashboardTargetsProps {
  goals: {
    id: string;
    name: string;
    current: number;
    goal: number;
    unit: string;
    percentage: number;
  }[];
}

function formatGoalValue(value: number, unit: string) {
  const upper = unit.toUpperCase();
  if (upper.includes("COP") || upper.includes("$")) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
  }
  return value.toLocaleString("es-CO");
}

export function DashboardTargets({ goals }: DashboardTargetsProps) {
  const now = new Date();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
  const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
  const daysLeft = Math.ceil((quarterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TargetIcon className="size-5" />
          Metas del {currentQuarter}º Trimestre
        </CardTitle>
        <CardDescription>
          Progreso hacia los objetivos — {now.getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay metas activas para este período.
          </p>
        )}
        <div className="flex flex-col gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatGoalValue(goal.current, goal.unit)} / {formatGoalValue(goal.goal, goal.unit)} {goal.unit}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={goal.percentage} className="flex-1" />
                <span className="text-sm font-semibold tabular-nums w-12 text-right">
                  {goal.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Quedan <strong className="text-foreground">{daysLeft} días</strong> para cerrar el trimestre
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
