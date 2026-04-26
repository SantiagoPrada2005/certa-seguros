import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getClientsTool = tool({
  description:
    "Obtener una lista de clientes o prospectos, opcionalmente filtrada por estado.",
  inputSchema: z.object({
    status: z
      .enum([
        "NUEVO",
        "CONTACTADO",
        "EN_PROCESO",
        "ACTIVO",
        "INACTIVO",
        "DESCARTADO",
      ])
      .optional()
      .describe("Filtrar por estado del cliente o prospecto"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Límite de resultados a devolver (máximo 50)"),
  }),
  execute: async ({ status, limit }) => {
    try {
      const clients = await prisma.client.findMany({
        where: status ? { status: status as any } : undefined,
        take: Math.min(limit, 50),
        select: {
          id: true,
          name: true,
          type: true,
          email: true,
          phone: true,
          status: true,
          documentNumber: true,
        },
      });
      return { clients };
    } catch (e: any) {
      return { error: `Error fetching clients: ${e.message}` };
    }
  },
});
