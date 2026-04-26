import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getRemindersTool = tool({
  description:
    "Obtener lista de recordatorios, opcionalmente filtrada por estado, prioridad o cliente.",
  inputSchema: z.object({
    status: z
      .enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO", "VENCIDO"])
      .optional()
      .describe("Filtrar por estado del recordatorio"),
    priority: z
      .enum(["INMEDIATA", "CRITICA", "ALTA", "MEDIA", "BAJA"])
      .optional()
      .describe("Filtrar por prioridad"),
    clientId: z
      .string()
      .optional()
      .describe("UUID del cliente para filtrar sus recordatorios"),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Límite de resultados (máximo 50)"),
  }),
  execute: async ({ status, priority, clientId, limit }) => {
    try {
      const reminders = await prisma.reminder.findMany({
        where: {
          ...(status ? { status: status as any } : {}),
          ...(priority ? { priority: priority as any } : {}),
          ...(clientId ? { clientId } : {}),
        },
        take: Math.min(limit, 50),
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
        select: {
          id: true,
          type: true,
          priority: true,
          status: true,
          dueDate: true,
          description: true,
          clientId: true,
          prospectId: true,
        },
      });
      return { reminders };
    } catch (e: any) {
      return { error: `Error al consultar recordatorios: ${e.message}` };
    }
  },
});
