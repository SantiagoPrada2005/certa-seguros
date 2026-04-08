"use server"

import db from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ClientStatus, ClientType } from "@/generated/prisma/client"

export async function getClients() {
  try {
    const clients = await db.client.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            services: true,
            policies: true,
          },
        },
      },
    })
    return { success: true, data: clients }
  } catch (error) {
    console.error("Error fetching clients:", error)
    return { success: false, error: "No se pudieron cargar los clientes" }
  }
}

export async function getClientDetails(clientId: string) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        services: {
          include: {
            service: {
              include: {
                subcategory: {
                  include: {
                    category: true
                  }
                }
              }
            }
          },
          orderBy: {
            assignedAt: "desc"
          }
        },
        policies: {
          orderBy: {
            endDate: "desc"
          }
        },
        invoices: {
          orderBy: {
            dueDate: "desc"
          }
        }
      },
    })
    
    if (!client) return { success: false, error: "Cliente no encontrado" }
    
    return { success: true, data: client }
  } catch (error) {
    console.error("Error fetching client details:", error)
    return { success: false, error: "No se pudieron cargar los detalles del cliente" }
  }
}

export async function getAvailableServices() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      include: {
        subcategory: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    })
    
    return { success: true, data: services }
  } catch (error) {
    console.error("Error fetching services:", error)
    return { success: false, error: "Error al cargar los servicios" }
  }
}

const AssignServiceSchema = z.object({
  clientId: z.string().min(1, "El ID del cliente es requerido"),
  serviceId: z.string().min(1, "El ID del servicio es requerido"),
})

export async function assignServiceToClient(data: z.infer<typeof AssignServiceSchema>) {
  try {
    const validatedData = AssignServiceSchema.parse(data)
    
    await db.clientService.create({
      data: {
        clientId: validatedData.clientId,
        serviceId: validatedData.serviceId,
      }
    })
    
    revalidatePath("/admin/clientes")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos" }
    }
    console.error("Error assigning service:", error)
    return { success: false, error: "No se pudo asignar el servicio. Verifica si ya fue asignado previamente." }
  }
}

const RemoveServiceSchema = z.object({
  clientServiceId: z.string().min(1, "El ID de la asignación es requerido"),
})

export async function removeServiceFromClient(data: z.infer<typeof RemoveServiceSchema>) {
  try {
    const validatedData = RemoveServiceSchema.parse(data)
    
    await db.clientService.delete({
      where: {
        id: validatedData.clientServiceId,
      }
    })
    
    revalidatePath("/admin/clientes")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos" }
    }
    console.error("Error removing service:", error)
    return { success: false, error: "No se pudo remover el servicio" }
  }
}
