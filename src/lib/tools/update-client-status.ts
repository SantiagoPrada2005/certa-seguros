import { z } from "zod";
import prisma from "@/lib/prisma";
import { createWriteTool } from "./with-confirmation";

const inputSchema = z.object({
  clientId: z.string().describe("UUID del cliente a actualizar"),
  status: z
    .enum(["ACTIVO", "INACTIVO", "MOROSO"])
    .describe("Nuevo estado del cliente"),
});

export const updateClientStatusTool = createWriteTool({
  description:
    "Actualizar el estado de un cliente (ACTIVO, INACTIVO o MOROSO).",
  inputSchema,
  preview: (params) => {
    return `Se cambiará el estado del cliente (ID: ${params.clientId}) a ${params.status}.`;
  },
  execute: async (params) => {
    const client = await prisma.client.findUnique({
      where: { id: params.clientId },
      select: { name: true, status: true },
    });
    if (!client) return { error: "Cliente no encontrado" };

    const oldStatus = client.status;

    const updated = await prisma.client.update({
      where: { id: params.clientId },
      data: { status: params.status as any },
    });

    await prisma.activityLog.create({
      data: {
        action: `Cliente ${client.name} cambió de estado: ${oldStatus} → ${params.status}`,
        type: params.status === "MOROSO" ? "DANGER" : "INFO",
        clientId: params.clientId,
      },
    });

    return { client: { id: updated.id, name: updated.name, oldStatus, newStatus: updated.status } };
  },
});
