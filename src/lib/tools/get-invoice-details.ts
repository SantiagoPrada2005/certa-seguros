import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getInvoiceDetailsTool = tool({
  description:
    "Obtener todos los detalles de una factura específica por su ID, incluyendo ítems y datos del cliente.",
  inputSchema: z.object({
    id: z.string().describe("UUID de la factura"),
  }),
  execute: async ({ id }) => {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: true,
        },
      });
      if (!invoice) return { error: "Factura no encontrada" };
      return {
        invoice: {
          ...invoice,
          subtotal: invoice.subtotal.toNumber(),
          discountAmount: invoice.discountAmount.toNumber(),
          taxAmount: invoice.taxAmount.toNumber(),
          total: invoice.total.toNumber(),
          items: invoice.items.map((item) => ({
            ...item,
            unitPrice: item.unitPrice.toNumber(),
            total: item.total.toNumber(),
          })),
        },
      };
    } catch (e: any) {
      return {
        error: `Error al consultar detalles de la factura: ${e.message}`,
      };
    }
  },
});
