"use client"

import { z } from "zod"

export const createProspectSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  type: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"),
  documentType: z.enum(["CC", "NIT", "CE", "PASAPORTE", "TI", "RUT"]).optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "DESCARTADO", "CONVERTIDO"]).default("NUEVO"),
  source: z.enum(["WEB_PUBLICA", "REFERIDOS", "REDES_SOCIALES", "DIRECTOS"]).optional().nullable(),
  serviceIds: z.array(z.string()).optional(),
})

export const updateProspectSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(["INDIVIDUAL", "BUSINESS"]).optional(),
  documentType: z.enum(["CC", "NIT", "CE", "PASAPORTE", "TI", "RUT"]).optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "DESCARTADO", "CONVERTIDO"]).optional(),
  source: z.enum(["WEB_PUBLICA", "REFERIDOS", "REDES_SOCIALES", "DIRECTOS"]).optional().nullable(),
  serviceIds: z.array(z.string()).optional(),
})
