import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getPaymentRequestsTool = tool({
  description:
    "Obtener lista de cuentas de cobro, opcionalmente filtrada por estado o cliente.",
  inputSchema: z.object({
    status: z
      .enum(["DRAFT", "PENDING", "PAID", "CANCELLED"])
      .optional()
      .describe("Filtrar por estado de la cuenta de cobro"),
    clientId: z
      .string()
      .optional()
      .describe("UUID del cliente para filtrar sus cuentas de cobro"),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Límite de resultados (máximo 50)"),
  }),
  execute: async ({ status, clientId, limit }) => {
    try {
      const where: any = {
        ...(status ? { status: status as any } : {}),
        ...(clientId ? { clientId } : {}),
      };

      const prs = await prisma.paymentRequest.findMany({
        where,
        take: Math.min(limit, 50),
        orderBy: { dueDate: "asc" },
        select: {
          id: true,
          number: true,
          date: true,
          dueDate: true,
          total: true,
          status: true,
          clientId: true,
          client: { select: { name: true } },
        },
      });
      return {
        paymentRequests: prs.map((pr) => ({
          ...pr,
          total: pr.total.toNumber(),
        })),
      };
    } catch (e: any) {
      return { error: `Error al consultar cuentas de cobro: ${e.message}` };
    }
  },
});
