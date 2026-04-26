import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getServiceDetailsTool = tool({
  description:
    "Obtener detalles completos de un servicio específico por su ID, incluyendo subcategoría y categoría.",
  inputSchema: z.object({
    id: z.string().describe("ID o UUID del servicio"),
  }),
  execute: async ({ id }) => {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          subcategory: { include: { category: true } },
        },
      });
      if (!service) return { error: "Servicio no encontrado" };
      return { service };
    } catch (e: any) {
      return { error: `Error fetching service details: ${e.message}` };
    }
  },
});
