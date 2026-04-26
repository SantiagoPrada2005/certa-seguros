import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getPaymentRequestDetailsTool = tool({
  description:
    "Obtener todos los detalles de una cuenta de cobro específica por su ID, incluyendo ítems y datos del cliente.",
  inputSchema: z.object({
    id: z.string().describe("UUID de la cuenta de cobro"),
  }),
  execute: async ({ id }) => {
    try {
      const pr = await prisma.paymentRequest.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: true,
        },
      });
      if (!pr) return { error: "Cuenta de cobro no encontrada" };
      return {
        paymentRequest: {
          ...pr,
          subtotal: pr.subtotal.toNumber(),
          discountAmount: pr.discountAmount.toNumber(),
          taxAmount: pr.taxAmount.toNumber(),
          total: pr.total.toNumber(),
          items: pr.items.map((item) => ({
            ...item,
            unitPrice: item.unitPrice.toNumber(),
            total: item.total.toNumber(),
          })),
        },
      };
    } catch (e: any) {
      return {
        error: `Error al consultar detalles de la cuenta de cobro: ${e.message}`,
      };
    }
  },
});
