import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getGoalsTool = tool({
  description:
    "Obtener lista de metas comerciales con su progreso, opcionalmente filtradas por categoría o estado.",
  inputSchema: z.object({
    category: z
      .enum(["VENTAS", "CLIENTES", "RENOVACIONES", "INGRESOS"])
      .optional()
      .describe("Filtrar por categoría de meta"),
    status: z
      .enum(["ON_TRACK", "AT_RISK", "BEHIND", "COMPLETED", "EXCEEDED"])
      .optional()
      .describe("Filtrar por estado de la meta"),
    activeOnly: z
      .boolean()
      .optional()
      .default(true)
      .describe("Mostrar solo metas activas"),
  }),
  execute: async ({ category, status, activeOnly }) => {
    try {
      const goals = await prisma.goal.findMany({
        where: {
          ...(activeOnly ? { isActive: true } : {}),
          ...(category ? { category: category as any } : {}),
          ...(status ? { status: status as any } : {}),
        },
        orderBy: { endDate: "asc" },
        include: {
          milestones: { orderBy: { value: "asc" } },
        },
      });
      return {
        goals: goals.map((g) => ({
          ...g,
          currentValue: g.currentValue.toNumber(),
          targetValue: g.targetValue.toNumber(),
          trend: g.trend.toNumber(),
          milestones: g.milestones.map((m) => ({
            ...m,
            value: m.value.toNumber(),
          })),
          progress: Math.round(
            (g.currentValue.toNumber() / g.targetValue.toNumber()) * 100,
          ),
        })),
      };
    } catch (e: any) {
      return { error: `Error al consultar metas: ${e.message}` };
    }
  },
});
