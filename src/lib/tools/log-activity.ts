import { z } from "zod";
import prisma from "@/lib/prisma";
import { createWriteTool } from "./with-confirmation";

const inputSchema = z.object({
  action: z.string().describe("Descripción de la actividad realizada"),
  type: z
    .enum(["SUCCESS", "INFO", "WARNING", "DANGER"])
    .optional()
    .default("INFO")
    .describe("Tipo de actividad"),
  clientId: z
    .string()
    .optional()
    .describe("UUID del cliente relacionado (opcional)"),
  prospectId: z
    .string()
    .optional()
    .describe("UUID del prospecto relacionado (opcional)"),
  metadata: z
    .any()
    .optional()
    .describe("Datos adicionales en formato JSON (opcional)"),
});

export const logActivityTool = createWriteTool({
  description:
    "Registrar una entrada en el registro de actividad del sistema.",
  inputSchema,
  preview: (params) => {
    return `Se registrará una actividad de tipo ${params.type ?? "INFO"}: "${params.action}".`;
  },
  execute: async (params) => {
    const activity = await prisma.activityLog.create({
      data: {
        action: params.action,
        type: params.type as any,
        clientId: params.clientId ?? null,
        prospectId: params.prospectId ?? null,
        metadata: params.metadata ?? undefined,
      },
    });

    return { activity };
  },
});
