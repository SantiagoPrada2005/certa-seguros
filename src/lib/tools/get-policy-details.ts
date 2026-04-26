import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getPolicyDetailsTool = tool({
  description:
    "Obtener todos los detalles de una póliza específica por su ID, incluyendo datos del cliente y servicio asociado.",
  inputSchema: z.object({
    id: z.string().describe("UUID de la póliza"),
  }),
  execute: async ({ id }) => {
    try {
      const policy = await prisma.policy.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              documentType: true,
              documentNumber: true,
            },
          },
          service: { select: { id: true, name: true, description: true } },
        },
      });
      if (!policy) return { error: "Póliza no encontrada" };
      return {
        policy: {
          ...policy,
          premiumAmount: policy.premiumAmount.toNumber(),
          commissionAmount: policy.commissionAmount.toNumber(),
        },
      };
    } catch (e: any) {
      return {
        error: `Error al consultar detalles de la póliza: ${e.message}`,
      };
    }
  },
});
