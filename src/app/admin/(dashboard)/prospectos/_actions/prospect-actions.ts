"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { unstable_rethrow } from "next/navigation"
import prisma from "@/lib/prisma"
import { ProspectStatus } from "@/generated/prisma"

// Schema for creating a prospect
const createProspectSchema = z.object({
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

// Schema for updating a prospect
const updateProspectSchema = z.object({
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

// Schema for converting a prospect to a client
const convertProspectToClientSchema = z.object({
  prospectId: z.string(),
  birthDate: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  initialServiceIds: z.array(z.string()).optional(),
})

export async function createProspect(data: z.infer<typeof createProspectSchema>) {
  try {
    const validated = createProspectSchema.parse(data)

    // Check for duplicate prospect by document number
    if (validated.documentNumber) {
      const existingByDoc = await prisma.prospect.findFirst({
        where: {
          documentNumber: validated.documentNumber,
          status: { not: "DESCARTADO" },
        },
        select: { id: true, name: true },
      })
      if (existingByDoc) {
        return {
          success: false,
          error: `Ya existe un prospecto activo con este documento: ${existingByDoc.name}`,
        }
      }
    }

    // Check for duplicate prospect by email
    if (validated.email) {
      const existingByEmail = await prisma.prospect.findFirst({
        where: {
          email: validated.email,
          status: { not: "DESCARTADO" },
        },
        select: { id: true, name: true },
      })
      if (existingByEmail) {
        return {
          success: false,
          error: `Ya existe un prospecto activo con este correo: ${existingByEmail.name}`,
        }
      }
    }

    // Also check if a client already exists with the same document or email
    if (validated.documentNumber) {
      const existingClientByDoc = await prisma.client.findFirst({
        where: { documentNumber: validated.documentNumber },
        select: { id: true, name: true },
      })
      if (existingClientByDoc) {
        return {
          success: false,
          error: `Ya existe un cliente con este documento: ${existingClientByDoc.name}. Considera agregarlo como cliente directamente.`,
        }
      }
    }

    if (validated.email) {
      const existingClientByEmail = await prisma.client.findFirst({
        where: { email: validated.email },
        select: { id: true, name: true },
      })
      if (existingClientByEmail) {
        return {
          success: false,
          error: `Ya existe un cliente con este correo: ${existingClientByEmail.name}. Considera agregarlo como cliente directamente.`,
        }
      }
    }

    const prospect = await prisma.prospect.create({
      data: {
        name: validated.name,
        type: validated.type,
        documentType: validated.documentType,
        documentNumber: validated.documentNumber,
        email: validated.email,
        phone: validated.phone,
        address: validated.address,
        status: validated.status as ProspectStatus,
        source: validated.source,
        services: validated.serviceIds
          ? {
              create: validated.serviceIds.map((serviceId) => ({
                service: { connect: { id: serviceId } },
              })),
            }
          : undefined,
      },
      include: {
        services: {
          include: {
            service: { select: { name: true } },
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: `Nuevo prospecto capturado: ${prospect.name}`,
        type: "INFO",
        prospectId: prospect.id,
      },
    })

    revalidatePath("/admin/prospectos")
    return { success: true, data: prospect }
  } catch (error) {
    unstable_rethrow(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el prospecto",
    }
  }
}

export async function updateProspect(id: string, data: z.infer<typeof updateProspectSchema>) {
  try {
    const validated = updateProspectSchema.parse(data)

    const { serviceIds, ...prospectData } = validated

    const prospect = await prisma.prospect.update({
      where: { id },
      data: prospectData,
      include: {
        services: {
          include: {
            service: { select: { name: true } },
          },
        },
      },
    })

    // Update services if provided
    if (serviceIds) {
      // Delete existing services
      await prisma.prospectService.deleteMany({
        where: { prospectId: id },
      })

      // Create new services
      if (serviceIds.length > 0) {
        await prisma.prospectService.createMany({
          data: serviceIds.map((serviceId) => ({
            prospectId: id,
            serviceId,
          })),
        })
      }
    }

    revalidatePath("/admin/prospectos")
    return { success: true, data: prospect }
  } catch (error) {
    unstable_rethrow(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar el prospecto",
    }
  }
}

export async function deleteProspect(id: string) {
  try {
    // Get prospect name for activity log
    const prospect = await prisma.prospect.findUnique({
      where: { id },
      select: { name: true },
    })

    if (!prospect) {
      return { success: false, error: "Prospecto no encontrado" }
    }

    await prisma.prospect.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: `Prospecto eliminado: ${prospect.name}`,
        type: "INFO",
      },
    })

    revalidatePath("/admin/prospectos")
    return { success: true }
  } catch (error) {
    unstable_rethrow(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar el prospecto",
    }
  }
}

export async function updateProspectStatus(id: string, status: "NUEVO" | "CONTACTADO" | "EN_PROCESO" | "DESCARTADO" | "CONVERTIDO") {
  try {
    const prospect = await prisma.prospect.update({
      where: { id },
      data: { status },
    })

    // Log activity
    const statusLabels: Record<string, string> = {
      NUEVO: "nuevo",
      CONTACTADO: "contactado",
      EN_PROCESO: "en proceso",
      DESCARTADO: "descartado",
      CONVERTIDO: "convertido a cliente",
    }

    await prisma.activityLog.create({
      data: {
        action: `Prospecto ${prospect.name} marcado como ${statusLabels[status] || status}`,
        type: "INFO",
        prospectId: id,
      },
    })

    revalidatePath("/admin/prospectos")
    return { success: true, data: prospect }
  } catch (error) {
    unstable_rethrow(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar el estado",
    }
  }
}

export async function convertProspectToClient(data: z.infer<typeof convertProspectToClientSchema>) {
  try {
    const validated = convertProspectToClientSchema.parse(data)

    // Get the prospect
    const prospect = await prisma.prospect.findUnique({
      where: { id: validated.prospectId },
      include: {
        services: true,
        reminders: true,
        activityLogs: true,
      },
    })

    if (!prospect) {
      return { success: false, error: "Prospecto no encontrado" }
    }

    if (prospect.status === "CONVERTIDO") {
      return { success: false, error: "Este prospecto ya fue convertido a cliente" }
    }

    // Check if a client already exists with the same document or email
    let existingClientId: string | null = null
    let existingClientName: string | null = null

    if (prospect.documentNumber) {
      const clientByDoc = await prisma.client.findFirst({
        where: { documentNumber: prospect.documentNumber },
        select: { id: true, name: true },
      })
      if (clientByDoc) {
        existingClientId = clientByDoc.id
        existingClientName = clientByDoc.name
      }
    }

    if (!existingClientId && prospect.email) {
      const clientByEmail = await prisma.client.findFirst({
        where: { email: prospect.email },
        select: { id: true, name: true },
      })
      if (clientByEmail) {
        existingClientId = clientByEmail.id
        existingClientName = clientByEmail.name
      }
    }

    // If a client already exists, return conflict info instead of creating a duplicate
    if (existingClientId) {
      return {
        success: false,
        error: `Ya existe un cliente con los mismos datos: ${existingClientName}. No se puede crear un cliente duplicado.`,
        existingClientId,
        existingClientName,
      }
    }

    // Create the client in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create new client
      const newClient = await tx.client.create({
        data: {
          name: prospect.name,
          type: prospect.type,
          documentType: prospect.documentType,
          documentNumber: prospect.documentNumber,
          email: prospect.email,
          phone: prospect.phone,
          address: prospect.address,
          birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
          city: validated.city,
          notes: validated.notes,
          status: "ACTIVO",
          source: prospect.source,
          services: prospect.services.length > 0
            ? {
                create: prospect.services.map((s) => ({
                  service: { connect: { id: s.serviceId } },
                })),
              }
            : undefined,
        },
      })

      // 2. Migrate reminders from prospect to client
      if (prospect.reminders.length > 0) {
        await tx.reminder.updateMany({
          where: { prospectId: prospect.id },
          data: {
            clientId: newClient.id,
            prospectId: null,
          },
        })
      }

      // 3. Migrate activity logs from prospect to client
      if (prospect.activityLogs.length > 0) {
        await tx.activityLog.updateMany({
          where: { prospectId: prospect.id },
          data: {
            clientId: newClient.id,
            prospectId: null,
          },
        })
      }

      // 4. Update prospect status to CONVERTIDO
      await tx.prospect.update({
        where: { id: prospect.id },
        data: { status: "CONVERTIDO" },
      })

      // 5. Log the conversion
      await tx.activityLog.create({
        data: {
          action: `Prospecto convertido a cliente: ${prospect.name}`,
          type: "SUCCESS",
          clientId: newClient.id,
        },
      })

      return newClient
    })

    revalidatePath("/admin/prospectos")
    revalidatePath("/admin/clientes")
    return { success: true, data: result }
  } catch (error) {
    unstable_rethrow(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al convertir el prospecto a cliente",
    }
  }
}

// Helper: Get services for prospect form
export async function getServicesForProspecting() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
      },
    })

    return { success: true, data: services }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener servicios",
    }
  }
}

// Helper: Get prospects for dropdowns
export async function getProspectsForReminders() {
  try {
    const prospects = await prisma.prospect.findMany({
      where: {
        status: { not: "DESCARTADO" },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    })

    return { success: true, data: prospects }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener prospectos",
    }
  }
}
