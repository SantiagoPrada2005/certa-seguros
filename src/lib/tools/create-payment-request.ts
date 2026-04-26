import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const createPaymentRequestTool = tool({
  description:
    "Crea una nueva cuenta de cobro para un cliente. Los campos taxRate, taxAmount por defecto son 0. Incluye datos bancarios opcionales.",
  inputSchema: z.object({
    number: z.string().describe("Número de la cuenta de cobro (ej: CC-001)"),
    date: z.string().describe("Fecha de emisión (ISO string)"),
    dueDate: z.string().describe("Fecha de vencimiento (ISO string)"),
    subtotal: z.number().min(0).describe("Subtotal antes de impuestos y descuentos"),
    discountAmount: z.number().min(0).optional().default(0).describe("Valor del descuento"),
    discountDescription: z.string().optional().describe("Motivo del descuento"),
    taxRate: z.number().min(0).max(1).optional().default(0).describe("Tasa de impuesto (0 = sin IVA, 0.19 = 19%)"),
    taxAmount: z.number().min(0).optional().default(0).describe("Valor del impuesto calculado"),
    total: z.number().min(0).describe("Total a pagar"),
    notes: z.string().optional().describe("Notas adicionales"),
    bankName: z.string().optional().describe("Nombre del banco para pago"),
    accountType: z.string().optional().describe("Tipo de cuenta (Ahorros, Corriente)"),
    accountNumber: z.string().optional().describe("Número de cuenta bancaria"),
    clientId: z.string().min(1).describe("UUID del cliente"),
    items: z.array(z.object({
      description: z.string().min(1).describe("Descripción del ítem"),
      quantity: z.number().int().min(1).optional().default(1).describe("Cantidad"),
      unitPrice: z.number().min(0).describe("Valor unitario"),
      total: z.number().min(0).describe("Total del ítem"),
    })).min(1, "Al menos un ítem requerido"),
    confirmed: z.boolean().optional().default(false).describe("Si es false, solo muestra vista previa. Debe ser true para ejecutar."),
  }),
  execute: async (input) => {
    const { confirmed, ...data } = input;

    if (!confirmed) {
      // Vista previa
      return {
        preview: true,
        message: `Se creará una cuenta de cobro para el cliente.`,
        data: {
          number: data.number,
          subtotal: data.subtotal,
          discountAmount: data.discountAmount,
          taxRate: data.taxRate,
          taxAmount: data.taxAmount,
          total: data.total,
          itemsCount: data.items.length,
          bankName: data.bankName || null,
        },
      };
    }

    try {
      const pr = await prisma.paymentRequest.create({
        data: {
          number: data.number,
          date: new Date(data.date),
          dueDate: new Date(data.dueDate),
          subtotal: data.subtotal,
          discountAmount: data.discountAmount ?? 0,
          discountDescription: data.discountDescription,
          taxRate: data.taxRate ?? 0,
          taxAmount: data.taxAmount ?? 0,
          total: data.total,
          notes: data.notes,
          bankName: data.bankName,
          accountType: data.accountType,
          accountNumber: data.accountNumber,
          clientId: data.clientId,
          items: { create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice,
            total: item.total,
          })) },
        },
        include: { items: true },
      });

      return {
        success: true,
        paymentRequest: {
          id: pr.id,
          number: pr.number,
          total: pr.total.toNumber(),
          status: pr.status,
        },
      };
    } catch (e: any) {
      return { error: `Error al crear cuenta de cobro: ${e.message}` };
    }
  },
});
