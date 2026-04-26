import { z } from "zod";
import prisma from "@/lib/prisma";
import { createWriteTool } from "./with-confirmation";

const inputSchema = z.object({
  policyId: z.string().describe("UUID de la póliza a actualizar"),
  status: z
    .enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING_RENEWAL"])
    .describe("Nuevo estado de la póliza"),
});

export const updatePolicyStatusTool = createWriteTool({
  description:
    "Actualizar el estado de una póliza (ACTIVE, EXPIRED, CANCELLED o PENDING_RENEWAL).",
  inputSchema,
  preview: (params) => {
    return `Se cambiará el estado de la póliza (ID: ${params.policyId}) a ${params.status}.`;
  },
  execute: async (params) => {
    const policy = await prisma.policy.findUnique({
      where: { id: params.policyId },
      select: {
        policyNumber: true,
        status: true,
        clientId: true,
        client: { select: { name: true } },
      },
    });
    if (!policy) return { error: "Póliza no encontrada" };

    const oldStatus = policy.status;

    const updated = await prisma.policy.update({
      where: { id: params.policyId },
      data: { status: params.status as any },
    });

    const action =
      params.status === "CANCELLED"
        ? `Póliza ${policy.policyNumber} de ${policy.client.name} fue cancelada`
        : params.status === "PENDING_RENEWAL"
          ? `Póliza ${policy.policyNumber} de ${policy.client.name} marcada para renovación`
          : `Póliza ${policy.policyNumber} de ${policy.client.name}: ${oldStatus} → ${params.status}`;

    await prisma.activityLog.create({
      data: {
        action,
        type:
          params.status === "CANCELLED"
            ? "WARNING"
            : params.status === "EXPIRED"
              ? "WARNING"
              : "INFO",
        clientId: policy.clientId,
      },
    });

    return { policy: { id: updated.id, policyNumber: updated.policyNumber, oldStatus, newStatus: updated.status } };
  },
});
