import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getRecentActivityTool = tool({
  description:
    "Obtener la actividad reciente del sistema (feed del dashboard).",
  inputSchema: z.object({
    type: z
      .enum(["SUCCESS", "INFO", "WARNING", "DANGER"])
      .optional()
      .describe("Filtrar por tipo de actividad"),
    clientId: z
      .string()
      .optional()
      .describe("UUID del cliente para ver su actividad"),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Cantidad de actividades a devolver (máximo 50)"),
  }),
  execute: async ({ type, clientId, limit }) => {
    try {
      const activities = await prisma.activityLog.findMany({
        where: {
          ...(type ? { type: type as any } : {}),
          ...(clientId ? { clientId } : {}),
        },
        take: Math.min(limit, 50),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          type: true,
          createdAt: true,
          clientId: true,
          prospectId: true,
        },
      });
      return { activities };
    } catch (e: any) {
      return { error: `Error al consultar actividad: ${e.message}` };
    }
  },
});
