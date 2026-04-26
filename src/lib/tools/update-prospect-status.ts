import { z } from "zod";
import prisma from "@/lib/prisma";
import { createWriteTool } from "./with-confirmation";

const inputSchema = z.object({
  prospectId: z.string().describe("UUID del prospecto a actualizar"),
  status: z
    .enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "DESCARTADO", "CONVERTIDO"])
    .describe("Nuevo estado del prospecto"),
});

export const updateProspectStatusTool = createWriteTool({
  description: "Actualizar el estado de un prospecto en el pipeline de ventas.",
  inputSchema,
  preview: (params) => {
    return `Se cambiará el estado del prospecto (ID: ${params.prospectId}) a ${params.status}.`;
  },
  execute: async (params) => {
    const prospect = await prisma.prospect.findUnique({
      where: { id: params.prospectId },
      select: { name: true, status: true, deletedAt: true },
    });
    if (!prospect || prospect.deletedAt)
      return { error: "Prospecto no encontrado" };

    const oldStatus = prospect.status;

    const updated = await prisma.prospect.update({
      where: { id: params.prospectId },
      data: { status: params.status as any },
    });

    await prisma.activityLog.create({
      data: {
        action: `Prospecto ${prospect.name} cambió de estado: ${oldStatus} → ${params.status}`,
        type: params.status === "CONVERTIDO" ? "SUCCESS" : "INFO",
        prospectId: params.prospectId,
      },
    });

    return { prospect: { id: updated.id, name: updated.name, oldStatus, newStatus: updated.status } };
  },
});
