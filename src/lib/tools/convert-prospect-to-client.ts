import { z } from "zod";
import prisma from "@/lib/prisma";
import { createWriteTool } from "./with-confirmation";

const inputSchema = z.object({
  prospectId: z.string().describe("UUID del prospecto a convertir"),
  birthDate: z
    .string()
    .optional()
    .describe("Fecha de nacimiento en formato ISO (solo para personas naturales)"),
  city: z.string().optional().describe("Ciudad de residencia"),
  notes: z.string().optional().describe("Notas adicionales sobre el cliente"),
});

export const convertProspectToClientTool = createWriteTool({
  description:
    "Convertir un prospecto en cliente. El prospecto debe estar en estado EN_PROCESO o CONTACTADO. Se migran sus datos, recordatorios y actividad.",
  inputSchema,
  preview: (params) => {
    return `Se convertirá al prospecto (ID: ${params.prospectId}) a cliente ACTIVO. Se migrarán sus datos, recordatorios y registro de actividad.`;
  },
  execute: async (params) => {
    const prospect = await prisma.prospect.findUnique({
      where: { id: params.prospectId },
      include: {
        services: { include: { service: true } },
        reminders: true,
        activityLogs: true,
      },
    });
    if (!prospect || prospect.deletedAt)
      return { error: "Prospecto no encontrado" };
    if (
      prospect.status !== "EN_PROCESO" &&
      prospect.status !== "CONTACTADO"
    ) {
      return {
        error: `El prospecto está en estado ${prospect.status}. Debe estar EN_PROCESO o CONTACTADO para convertirlo.`,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the client
      const client = await tx.client.create({
        data: {
          name: prospect.name,
          type: prospect.type,
          documentNumber: prospect.documentNumber,
          email: prospect.email,
          phone: prospect.phone,
          address: prospect.address,
          birthDate: params.birthDate ? new Date(params.birthDate) : null,
          city: params.city ?? null,
          notes: params.notes ?? null,
          status: "ACTIVO",
          source: prospect.source,
        },
      });

      // 2. Migrate prospect services to client
      if (prospect.services.length > 0) {
        await tx.clientService.createMany({
          data: prospect.services.map((ps) => ({
            clientId: client.id,
            serviceId: ps.serviceId,
          })),
        });
      }

      // 3. Reassign reminders to the new client
      for (const reminder of prospect.reminders) {
        await tx.reminder.update({
          where: { id: reminder.id },
          data: { clientId: client.id, prospectId: null },
        });
      }

      // 4. Reassign activity logs
      for (const log of prospect.activityLogs) {
        await tx.activityLog.update({
          where: { id: log.id },
          data: { clientId: client.id, prospectId: null },
        });
      }

      // 5. Mark prospect as converted
      await tx.prospect.update({
        where: { id: params.prospectId },
        data: { status: "CONVERTIDO" },
      });

      // 6. Log the conversion
      await tx.activityLog.create({
        data: {
          action: `Prospecto ${prospect.name} convertido a cliente exitosamente`,
          type: "SUCCESS",
          clientId: client.id,
        },
      });

      return client;
    });

    return {
      client: {
        id: result.id,
        name: result.name,
        status: result.status,
      },
      message: `Prospecto convertido a cliente exitosamente.`,
    };
  },
});
