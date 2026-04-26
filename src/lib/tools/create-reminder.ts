import { z } from "zod";
import prisma from "@/lib/prisma";
import { createWriteTool } from "./with-confirmation";

const inputSchema = z.object({
  type: z
    .enum([
      "RENOVACION_SOAT",
      "RENOVACION_POLIZA",
      "SEGUIMIENTO_ARL",
      "LLAMADA",
      "VISITA",
      "OTRO",
    ])
    .describe("Tipo de recordatorio"),
  priority: z
    .enum(["INMEDIATA", "CRITICA", "ALTA", "MEDIA", "BAJA"])
    .optional()
    .default("MEDIA")
    .describe("Prioridad del recordatorio"),
  dueDate: z.string().describe("Fecha de vencimiento en formato ISO (YYYY-MM-DD)"),
  description: z
    .string()
    .optional()
    .describe("Descripción o nota del recordatorio"),
  clientId: z
    .string()
    .optional()
    .describe("UUID del cliente (opcional si se asocia a prospecto)"),
  prospectId: z
    .string()
    .optional()
    .describe("UUID del prospecto (opcional si se asocia a cliente)"),
});

export const createReminderTool = createWriteTool({
  description: "Crear un recordatorio o alerta para un cliente o prospecto.",
  inputSchema,
  preview: (params) => {
    const clientName = params.clientId ? `cliente (ID: ${params.clientId})` : null;
    const prospectName = params.prospectId
      ? `prospecto (ID: ${params.prospectId})`
      : null;
    const subject = clientName ?? prospectName ?? "general";
    const parts = [
      `Se creará un recordatorio de tipo ${params.type}`,
      `con prioridad ${params.priority ?? "MEDIA"}`,
      `para ${subject}`,
      `con vencimiento el ${params.dueDate}`,
      params.description ? `: "${params.description}"` : "",
    ];
    return parts.filter(Boolean).join(" ");
  },
  execute: async (params) => {
    const clientName = params.clientId
      ? (await prisma.client.findUnique({
          where: { id: params.clientId },
          select: { name: true },
        }))?.name
      : null;
    const prospectName = params.prospectId
      ? (await prisma.prospect.findUnique({
          where: { id: params.prospectId },
          select: { name: true },
        }))?.name
      : null;
    const subjectName = clientName ?? prospectName ?? "general";

    const reminder = await prisma.reminder.create({
      data: {
        type: params.type as any,
        priority: (params.priority ?? "MEDIA") as any,
        dueDate: new Date(params.dueDate),
        description: params.description,
        clientId: params.clientId ?? null,
        prospectId: params.prospectId ?? null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Recordatorio creado para ${subjectName}: ${params.type}`,
        type: "INFO",
        clientId: params.clientId ?? null,
        prospectId: params.prospectId ?? null,
      },
    });

    return { reminder };
  },
});
