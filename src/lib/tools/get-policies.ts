import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getPoliciesTool = tool({
  description:
    "Buscar pólizas con filtros opcionales por tipo, estado o cliente.",
  inputSchema: z.object({
    type: z
      .enum(["SOAT", "VEHICULAR", "VIDA", "ARL", "TODO_RIESGO", "SALUD", "OTRO"])
      .optional()
      .describe("Filtrar por tipo de póliza"),
    status: z
      .enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING_RENEWAL"])
      .optional()
      .describe("Filtrar por estado de la póliza"),
    clientId: z
      .string()
      .optional()
      .describe("UUID del cliente para filtrar sus pólizas"),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Límite de resultados (máximo 50)"),
  }),
  execute: async ({ type, status, clientId, limit }) => {
    try {
      const policies = await prisma.policy.findMany({
        where: {
          ...(type ? { type: type as any } : {}),
          ...(status ? { status: status as any } : {}),
          ...(clientId ? { clientId } : {}),
        },
        take: Math.min(limit, 50),
        orderBy: { endDate: "asc" },
        select: {
          id: true,
          policyNumber: true,
          type: true,
          status: true,
          startDate: true,
          endDate: true,
          premiumAmount: true,
          clientId: true,
          client: { select: { name: true } },
        },
      });
      return {
        policies: policies.map((p) => ({
          ...p,
          premiumAmount: p.premiumAmount.toNumber(),
        })),
      };
    } catch (e: any) {
      return { error: `Error al consultar pólizas: ${e.message}` };
    }
  },
});
