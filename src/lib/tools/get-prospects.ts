import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getProspectsTool = tool({
  description:
    "Obtener una lista de prospectos (leads), opcionalmente filtrada por estado o fuente.",
  inputSchema: z.object({
    status: z
      .enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "DESCARTADO", "CONVERTIDO"])
      .optional()
      .describe("Filtrar por estado del prospecto"),
    source: z
      .enum(["WEB_PUBLICA", "REFERIDOS", "REDES_SOCIALES", "DIRECTOS"])
      .optional()
      .describe("Filtrar por fuente de origen"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Límite de resultados (máximo 50)"),
  }),
  execute: async ({ status, source, limit }) => {
    try {
      const prospects = await prisma.prospect.findMany({
        where: {
          deletedAt: null,
          ...(status ? { status: status as any } : {}),
          ...(source ? { source: source as any } : {}),
        },
        take: Math.min(limit, 50),
        select: {
          id: true,
          name: true,
          type: true,
          email: true,
          phone: true,
          status: true,
          source: true,
          createdAt: true,
        },
      });
      return { prospects };
    } catch (e: any) {
      return { error: `Error al consultar prospectos: ${e.message}` };
    }
  },
});
