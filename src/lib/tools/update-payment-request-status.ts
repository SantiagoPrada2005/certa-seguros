import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const updatePaymentRequestStatusTool = tool({
  description:
    "Cambia el estado de una cuenta de cobro (DRAFT, PENDING, PAID, CANCELLED).",
  inputSchema: z.object({
    paymentRequestId: z.string().describe("UUID de la cuenta de cobro"),
    status: z.enum(["DRAFT", "PENDING", "PAID", "CANCELLED"]).describe("Nuevo estado"),
    confirmed: z.boolean().optional().default(false).describe("Debe ser true para ejecutar"),
  }),
  execute: async ({ paymentRequestId, status, confirmed }) => {
    if (!confirmed) {
      return {
        preview: true,
        message: `Se cambiará el estado de la cuenta de cobro a: ${status}`,
      };
    }

    try {
      const updated = await prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: { status: status as any },
      });

      await prisma.activityLog.create({
        data: {
          action: `Estado de cuenta de cobro ${updated.number} actualizado a: ${status}`,
          type: status === "PAID" ? "SUCCESS" : "INFO",
          clientId: updated.clientId,
        },
      });

      return { success: true, status: updated.status };
    } catch (e: any) {
      return { error: `Error al actualizar estado: ${e.message}` };
    }
  },
});
