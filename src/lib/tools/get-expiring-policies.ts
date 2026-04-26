import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getExpiringPoliciesTool = tool({
  description:
    "Obtener pólizas que vencen dentro de un número determinado de días (útil para alertas proactivas de renovación).",
  inputSchema: z.object({
    days: z
      .number()
      .optional()
      .default(30)
      .describe("Número de días para buscar vencimientos (máximo 90)"),
    type: z
      .enum(["SOAT", "VEHICULAR", "VIDA", "ARL", "TODO_RIESGO", "SALUD", "OTRO"])
      .optional()
      .describe("Filtrar por tipo de póliza"),
  }),
  execute: async ({ days, type }) => {
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + Math.min(days, 90));

      const policies = await prisma.policy.findMany({
        where: {
          endDate: { gte: now, lte: future },
          status: { in: ["ACTIVE", "PENDING_RENEWAL"] },
          ...(type ? { type: type as any } : {}),
        },
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
          client: { select: { name: true, phone: true, email: true } },
        },
      });
      return {
        expiringCount: policies.length,
        policies: policies.map((p) => ({
          ...p,
          premiumAmount: p.premiumAmount.toNumber(),
          daysUntilExpiry: Math.ceil(
            (p.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          ),
        })),
      };
    } catch (e: any) {
      return {
        error: `Error al consultar pólizas por vencer: ${e.message}`,
      };
    }
  },
});
