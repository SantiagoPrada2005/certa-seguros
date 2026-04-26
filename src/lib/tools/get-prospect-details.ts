import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getProspectDetailsTool = tool({
  description:
    "Obtener todos los detalles de un prospecto específico por su ID, incluyendo servicios de interés y recordatorios.",
  inputSchema: z.object({
    id: z.string().describe("UUID del prospecto"),
  }),
  execute: async ({ id }) => {
    try {
      const prospect = await prisma.prospect.findUnique({
        where: { id },
        include: {
          services: { include: { service: true } },
          reminders: true,
          activityLogs: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      });
      if (!prospect || prospect.deletedAt)
        return { error: "Prospecto no encontrado" };
      return { prospect };
    } catch (e: any) {
      return {
        error: `Error al consultar detalles del prospecto: ${e.message}`,
      };
    }
  },
});
