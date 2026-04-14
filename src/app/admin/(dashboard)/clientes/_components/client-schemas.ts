"use client"

import { z } from "zod"
import { ClientStatus, ClientType } from "@/generated/prisma/client"

export const CreateClientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.nativeEnum(ClientType).optional().default("INDIVIDUAL"),
  documentType: z.string().optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  email: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(ClientStatus).optional().default("ACTIVO"),
  tagIds: z.array(z.string()).optional(),
})

export const UpdateClientSchema = z.object({
  clientId: z.string().min(1, "El ID del cliente es requerido"),
  name: z.string().min(1, "El nombre es requerido").optional(),
  type: z.nativeEnum(ClientType).optional(),
  documentType: z.string().optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  email: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(ClientStatus).optional(),
  tagIds: z.array(z.string()).optional(),
})
