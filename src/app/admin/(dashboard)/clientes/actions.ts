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
        tags: true,
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
        tags: true,
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

    // Serialize Prisma Decimal to number for Next.js Client Components
    const serializedClient = {
      ...client,
      services: client.services.map(cs => ({
        ...cs,
        service: {
          ...cs.service,
          price: cs.service.price ? cs.service.price.toNumber() : null
        }
      })),
      policies: client.policies.map(p => ({
        ...p,
        premiumAmount: p.premiumAmount.toNumber(),
        commissionAmount: p.commissionAmount.toNumber()
      })),
      invoices: client.invoices.map(i => ({
        ...i,
        subtotal: i.subtotal.toNumber(),
        discountAmount: i.discountAmount.toNumber(),
        taxRate: i.taxRate.toNumber(),
        taxAmount: i.taxAmount.toNumber(),
        total: i.total.toNumber()
      }))
    }

    return { success: true, data: serializedClient }
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

    const serializedServices = services.map(s => ({
      ...s,
      price: s.price ? s.price.toNumber() : null
    }))

    return { success: true, data: serializedServices }
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

const CreateClientSchema = z.object({
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

export async function createClient(data: z.infer<typeof CreateClientSchema>) {
  try {
    const validatedData = CreateClientSchema.parse(data)

    // Convert empty strings to null for optional unique fields if any
    const emailToSave = validatedData.email === "" ? null : validatedData.email;

    const newClient = await db.client.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        documentType: validatedData.documentType as any,
        documentNumber: validatedData.documentNumber,
        email: emailToSave,
        phone: validatedData.phone,
        address: validatedData.address,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        city: validatedData.city,
        notes: validatedData.notes,
        status: validatedData.status,
        tags: validatedData.tagIds
          ? { connect: validatedData.tagIds.map(id => ({ id })) }
          : undefined,
      }
    })

    revalidatePath("/admin/clientes")
    return { success: true, data: newClient }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos", validationErrors: error.errors }
    }
    console.error("Error creating client:", error)
    return { success: false, error: "No se pudo crear el cliente" }
  }
}

export async function getAllTags() {
  try {
    const tags = await db.clientTag.findMany({
      orderBy: { name: "asc" },
    })
    return { success: true, data: tags }
  } catch (error) {
    console.error("Error fetching tags:", error)
    return { success: false, error: "No se pudieron cargar las etiquetas" }
  }
}

export async function createTag(name: string) {
  try {
    const tag = await db.clientTag.create({
      data: { name },
    })
    revalidatePath("/admin/clientes")
    return { success: true, data: tag }
  } catch (error) {
    console.error("Error creating tag:", error)
    return { success: false, error: "No se pudo crear la etiqueta" }
  }
}
