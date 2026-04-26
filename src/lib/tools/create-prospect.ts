import { z } from "zod";
import prisma from "@/lib/prisma";
import { createWriteTool } from "./with-confirmation";

const inputSchema = z.object({
  name: z.string().describe("Nombre completo del prospecto"),
  type: z
    .enum(["INDIVIDUAL", "BUSINESS"])
    .optional()
    .default("INDIVIDUAL")
    .describe("Tipo de prospecto: persona natural o empresa"),
  documentNumber: z
    .string()
    .optional()
    .describe("Número de documento (CC, NIT, etc.)"),
  email: z.string().email().optional().describe("Correo electrónico"),
  phone: z.string().optional().describe("Número de teléfono"),
  source: z
    .enum(["WEB_PUBLICA", "REFERIDOS", "REDES_SOCIALES", "DIRECTOS"])
    .optional()
    .default("DIRECTOS")
    .describe("Fuente de origen del prospecto"),
  serviceIds: z
    .array(z.string())
    .optional()
    .describe("Lista de UUIDs de servicios de interés"),
});

export const createProspectTool = createWriteTool({
  description: "Registrar un nuevo prospecto (lead) en el sistema.",
  inputSchema,
  preview: (params) => {
    const parts = [
      `Se registrará un nuevo prospecto: ${params.name}`,
      params.documentNumber
        ? `(${params.type === "BUSINESS" ? "NIT" : "CC"} ${params.documentNumber})`
        : "",
      `fuente ${params.source ?? "DIRECTOS"}`,
      params.serviceIds?.length
        ? `interesado en ${params.serviceIds.length} servicio(s)`
        : "",
    ];
    return parts.filter(Boolean).join(" ");
  },
  execute: async (params) => {
    const prospect = await prisma.prospect.create({
      data: {
        name: params.name,
        type: params.type as any,
        documentNumber: params.documentNumber ?? null,
        email: params.email ?? null,
        phone: params.phone ?? null,
        source: (params.source ?? "DIRECTOS") as any,
        status: "NUEVO",
      },
    });

    if (params.serviceIds?.length) {
      await prisma.prospectService.createMany({
        data: params.serviceIds.map((serviceId) => ({
          prospectId: prospect.id,
          serviceId,
        })),
      });
    }

    await prisma.activityLog.create({
      data: {
        action: `Nuevo prospecto registrado: ${params.name}`,
        type: "INFO",
        prospectId: prospect.id,
      },
    });

    return { prospect: { id: prospect.id, name: prospect.name, status: prospect.status } };
  },
});
