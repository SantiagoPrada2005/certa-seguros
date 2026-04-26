"use client";

import { motion, type Variants } from "framer-motion";
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

  const goalsContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const goalItemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

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
        <motion.div
          initial="hidden"
          animate="show"
          variants={goalsContainerVariants}
          className="flex flex-col gap-6"
        >
          {goals.map((goal, idx) => (
            <motion.div
              key={goal.id}
              variants={goalItemVariants}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatGoalValue(goal.current, goal.unit)} / {formatGoalValue(goal.goal, goal.unit)} {goal.unit}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex-1"
                  initial={{ scaleX: 0, transformOrigin: "left" }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.15 + idx * 0.08, ease: "easeOut" }}
                >
                  <Progress value={goal.percentage} className="flex-1" />
                </motion.div>
                <motion.span
                  className="text-sm font-semibold tabular-nums w-12 text-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + idx * 0.08 }}
                >
                  {goal.percentage}%
                </motion.span>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
