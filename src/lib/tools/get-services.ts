import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getServicesTool = tool({
  description: "Obtener la lista de servicios ofrecidos.",
  inputSchema: z.object({
    activeOnly: z
      .boolean()
      .optional()
      .default(true)
      .describe("Devolver solo los servicios activos"),
  }),
  execute: async ({ activeOnly }) => {
    try {
      const services = await prisma.service.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        select: {
          id: true,
          name: true,
          validityType: true,
          price: true,
          description: true,
        },
      });
      return { services };
    } catch (e: any) {
      return { error: `Error fetching services: ${e.message}` };
    }
  },
});
