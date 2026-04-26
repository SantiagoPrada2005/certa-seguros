import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getClientDetailsTool = tool({
  description:
    "Obtener todos los detalles de un cliente específico por su ID, incluyendo pólizas y servicios.",
  inputSchema: z.object({
    id: z.string().describe("UUID del cliente"),
  }),
  execute: async ({ id }) => {
    try {
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          policies: true,
          services: { include: { service: true } },
        },
      });
      if (!client) return { error: "Cliente no encontrado" };
      return { client };
    } catch (e: any) {
      return { error: `Error fetching client details: ${e.message}` };
    }
  },
});
