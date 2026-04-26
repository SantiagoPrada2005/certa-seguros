import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getClientTagsTool = tool({
  description:
    "Listar todas las etiquetas de clientes, o buscar clientes por una etiqueta específica (ej: VIP, Frecuente).",
  inputSchema: z.object({
    tagName: z
      .string()
      .optional()
      .describe(
        "Nombre de la etiqueta para buscar clientes (ej: VIP, Frecuente). Si no se provee, lista todas las etiquetas.",
      ),
  }),
  execute: async ({ tagName }) => {
    try {
      if (tagName) {
        const tag = await prisma.clientTag.findUnique({
          where: { name: tagName },
          include: {
            clients: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                type: true,
              },
            },
          },
        });
        if (!tag) return { error: `No se encontró la etiqueta "${tagName}"` };
        return { tag: { name: tag.name, color: tag.color, clients: tag.clients } };
      }

      const tags = await prisma.clientTag.findMany({
        include: { _count: { select: { clients: true } } },
        orderBy: { name: "asc" },
      });
      return {
        tags: tags.map((t) => ({
          name: t.name,
          color: t.color,
          clientCount: t._count.clients,
        })),
      };
    } catch (e: any) {
      return { error: `Error al consultar etiquetas: ${e.message}` };
    }
  },
});
