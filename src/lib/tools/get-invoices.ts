import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getInvoicesTool = tool({
  description:
    "Obtener lista de facturas, opcionalmente filtrada por estado, cliente o solo vencidas.",
  inputSchema: z.object({
    status: z
      .enum(["DRAFT", "PENDING", "PAID", "OVERDUE"])
      .optional()
      .describe("Filtrar por estado de la factura"),
    clientId: z
      .string()
      .optional()
      .describe("UUID del cliente para filtrar sus facturas"),
    overdueOnly: z
      .boolean()
      .optional()
      .default(false)
      .describe("Si es true, solo facturas vencidas (OVERDUE o PENDING con dueDate anterior a hoy)"),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Límite de resultados (máximo 50)"),
  }),
  execute: async ({ status, clientId, overdueOnly, limit }) => {
    try {
      const where: any = {
        ...(status ? { status: status as any } : {}),
        ...(clientId ? { clientId } : {}),
      };

      if (overdueOnly) {
        where.OR = [
          { status: "OVERDUE" },
          { status: "PENDING", dueDate: { lt: new Date() } },
        ];
      }

      const invoices = await prisma.invoice.findMany({
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
        invoices: invoices.map((i) => ({
          ...i,
          total: i.total.toNumber(),
        })),
      };
    } catch (e: any) {
      return { error: `Error al consultar facturas: ${e.message}` };
    }
  },
});
