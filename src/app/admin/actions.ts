"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const clientCreateSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  type: z.enum(["INDIVIDUAL", "BUSINESS"]).optional(),
  documentType: z.enum(["CC", "NIT", "CE", "PASAPORTE", "TI", "RUT"]).optional(),
  documentNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "ACTIVO", "INACTIVO", "DESCARTADO"]).optional(),
  source: z.enum(["WEB_PUBLICA", "REFERIDOS", "REDES_SOCIALES", "DIRECTOS"]).optional(),
});

const serviceCreateSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  validityType: z.enum(["UNICA_VEZ", "ANUAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL"]).optional(),
  price: z.coerce.number().optional(),
  priceDescription: z.string().optional(),
  subcategoryId: z.string().min(1, "Subcategoría requerida"),
});

const categoryCreateSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
});

const subcategoryCreateSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  categoryId: z.string().min(1, "Categoría requerida"),
});

const reminderCreateSchema = z.object({
  type: z.enum(["RENOVACION_SOAT", "RENOVACION_POLIZA", "SEGUIMIENTO_ARL", "LLAMADA", "VISITA", "OTRO"]),
  priority: z.enum(["INMEDIATA", "CRITICA", "ALTA", "MEDIA", "BAJA"]).optional(),
  status: z.enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO", "VENCIDO"]).optional(),
  dueDate: z.string().min(1, "Fecha requerida"),
  description: z.string().optional(),
  clientId: z.string().min(1, "Cliente requerido"),
});

const goalSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  category: z.enum(["VENTAS", "CLIENTES", "RENOVACIONES", "INGRESOS"]),
  period: z.enum(["MENSUAL", "TRIMESTRAL", "ANUAL"]),
  targetValue: z.coerce.number().min(1, "Objetivo requerido"),
  currentValue: z.coerce.number().optional(),
  unit: z.string().min(1, "Unidad requerida"),
  startDate: z.string().min(1, "Fecha inicio requerida"),
  endDate: z.string().min(1, "Fecha fin requerida"),
  isActive: z.boolean().optional(),
});

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
});

const invoiceCreateSchema = z.object({
  number: z.string().min(1, "Número de factura requerido"),
  date: z.string().min(1),
  dueDate: z.string().min(1),
  clientId: z.string().min(1, "Cliente requerido"),
  subtotal: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).optional().default(0),
  taxRate: z.coerce.number().min(0).max(1).optional().default(0.19),
  taxAmount: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "Al menos un ítem requerido"),
});

// ─── Action Result Type ───────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Client Actions ───────────────────────────────────────────────────────────

export async function createClient(
  formData: Record<string, string>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = clientCreateSchema.parse(formData);
    const client = await prisma.client.create({
      data: {
        ...validated,
        email: validated.email || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Nuevo prospecto registrado: ${client.name}`,
        type: "INFO",
        clientId: client.id,
      },
    });

    revalidatePath("/admin/prospectos");
    return { success: true, data: { id: client.id } };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("createClient error:", err);
    return { success: false, error: "No se pudo crear el prospecto" };
  }
}

export async function updateClient(
  id: string,
  formData: Record<string, string>
): Promise<ActionResult> {
  try {
    const validated = clientCreateSchema.parse(formData);
    await prisma.client.update({
      where: { id },
      data: {
        ...validated,
        email: validated.email || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Datos actualizados: ${validated.name}`,
        type: "INFO",
        clientId: id,
      },
    });

    revalidatePath("/admin/prospectos");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("updateClient error:", err);
    return { success: false, error: "No se pudo actualizar el prospecto" };
  }
}

export async function updateClientStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  try {
    await prisma.client.update({ where: { id }, data: { status: status as any } });
    await prisma.activityLog.create({
      data: {
        action: `Estado del cliente actualizado a: ${status}`,
        type: "INFO",
        clientId: id,
      },
    });
    revalidatePath("/admin/prospectos");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("updateClientStatus error:", err);
    return { success: false, error: "No se pudo actualizar el estado" };
  }
}

export async function deleteClient(id: string): Promise<ActionResult> {
  try {
    await prisma.activityLog.create({
      data: {
        action: "Cliente o prospecto eliminado",
        type: "WARNING",
      },
    });
    await prisma.client.delete({ where: { id } });
    revalidatePath("/admin/prospectos");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("deleteClient error:", err);
    return { success: false, error: "No se pudo eliminar el prospecto" };
  }
}

// ─── Service Actions ──────────────────────────────────────────────────────────

export async function createService(
  formData: Record<string, string>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = serviceCreateSchema.parse(formData);
    const service = await prisma.service.create({ data: validated });

    await prisma.activityLog.create({
      data: {
        action: `Nuevo servicio creado: ${service.name}`,
        type: "INFO",
      },
    });

    revalidatePath("/admin/servicios");
    return { success: true, data: { id: service.id } };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("createService error:", err);
    console.error("createService error:", err);
    return { success: false, error: "No se pudo crear el servicio" };
  }
}

export async function createServiceCategory(
  formData: Record<string, string>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = categoryCreateSchema.parse(formData);
    const category = await prisma.serviceCategory.create({ data: { name: validated.name, description: validated.description ?? null } });
    revalidatePath("/admin/servicios");
    return { success: true, data: { id: category.id } };
  } catch (err) {
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    console.error(err);
    return { success: false, error: "No se pudo crear la categoría (quizá ya existe otra con el mismo nombre)" };
  }
}

export async function createServiceSubcategory(
  formData: Record<string, string>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = subcategoryCreateSchema.parse(formData);
    const subcategory = await prisma.serviceSubcategory.create({ data: { name: validated.name, categoryId: validated.categoryId } });
    revalidatePath("/admin/servicios");
    return { success: true, data: { id: subcategory.id } };
  } catch (err) {
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    console.error(err);
    return { success: false, error: "No se pudo crear la subcategoría" };
  }
}

// ─── Invoice Actions ──────────────────────────────────────────────────────────

export async function createInvoice(
  formData: Record<string, unknown>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = invoiceCreateSchema.parse(formData);
    const { items, ...invoiceData } = validated;

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        date: new Date(invoiceData.date),
        dueDate: new Date(invoiceData.dueDate),
        items: { create: items },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Nueva factura creada: ${invoice.number}`,
        type: "INFO",
        clientId: invoice.clientId,
      },
    });

    revalidatePath("/admin/facturas");
    return { success: true, data: { id: invoice.id } };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("createInvoice error:", err);
    return { success: false, error: "No se pudo crear la factura" };
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE"
): Promise<ActionResult> {
  try {
    await prisma.invoice.update({ where: { id }, data: { status } });
    revalidatePath("/admin/facturas");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("updateInvoiceStatus error:", err);
    return { success: false, error: "No se pudo actualizar la factura" };
  }
}

// ─── Reminder Actions ─────────────────────────────────────────────────────────

export async function createReminder(
  formData: Record<string, string>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = reminderCreateSchema.parse(formData);
    const reminder = await prisma.reminder.create({
      data: {
        ...validated,
        dueDate: new Date(validated.dueDate),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Recordatorio programado: ${reminder.type.replace(/_/g, " ")}`,
        type: "INFO",
        clientId: reminder.clientId,
      },
    });

    revalidatePath("/admin/recordatorios");
    return { success: true, data: { id: reminder.id } };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("createReminder error:", err);
    return { success: false, error: "No se pudo crear el recordatorio" };
  }
}

export async function markReminderComplete(id: string): Promise<ActionResult> {
  try {
    await prisma.reminder.update({
      where: { id },
      data: { status: "COMPLETADO" },
    });
    revalidatePath("/admin/recordatorios");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("markReminderComplete error:", err);
    return { success: false, error: "No se pudo completar el recordatorio" };
  }
}

// ─── Goal Actions ─────────────────────────────────────────────────────────────

export async function createGoal(
  formData: Record<string, any>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = goalSchema.parse(formData);
    const goal = await prisma.goal.create({
      data: {
        name: validated.name,
        description: validated.description,
        category: validated.category,
        period: validated.period,
        unit: validated.unit,
        targetValue: validated.targetValue,
        currentValue: validated.currentValue ?? 0,
        isActive: true,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
      },
    });

    revalidatePath("/admin/metas");
    return { success: true, data: { id: goal.id } };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("createGoal error:", err);
    return { success: false, error: "No se pudo crear la meta" };
  }
}

export async function updateGoal(
  id: string,
  formData: Record<string, any>
): Promise<ActionResult> {
  try {
    const validated = goalSchema.parse(formData);
    await prisma.goal.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description,
        category: validated.category,
        period: validated.period,
        unit: validated.unit,
        targetValue: validated.targetValue,
        currentValue: validated.currentValue,
        isActive: validated.isActive,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
      },
    });

    revalidatePath("/admin/metas");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("updateGoal error:", err);
    return { success: false, error: "No se pudo actualizar la meta" };
  }
}

/**
 * Calculates the current value for a goal based on live database data.
 */
export async function calculateGoalProgress(goal: {
  category: string;
  unit: string;
  startDate: Date | string;
  endDate: Date | string;
}) {
  const start = new Date(goal.startDate);
  const end = new Date(goal.endDate);

  switch (goal.category) {
    case "VENTAS":
      // If unit mentions COP/currency, sum the premium amounts
      if (goal.unit.toUpperCase().includes("COP") || goal.unit.toUpperCase().includes("$")) {
        const res = await prisma.policy.aggregate({
          _sum: { premiumAmount: true },
          where: { createdAt: { gte: start, lte: end } },
        });
        return Number(res._sum.premiumAmount || 0);
      }
      // Otherwise count policies
      return await prisma.policy.count({
        where: { createdAt: { gte: start, lte: end } },
      });

    case "CLIENTES":
      // Count new clients registered in the period
      return await prisma.client.count({
        where: { createdAt: { gte: start, lte: end } },
      });

    case "RENOVACIONES":
      // A renewal is a policy starting in range where the client had at least 
      // one policy before this period.
      return await prisma.policy.count({
        where: {
          startDate: { gte: start, lte: end },
          client: {
            policies: {
              some: {
                startDate: { lt: start },
              },
            },
          },
        },
      });

    case "INGRESOS":
      // Sum of all PAID invoices in the range
      const res = await prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          status: "PAID",
          date: { gte: start, lte: end },
        },
      });
      return Number(res._sum.total || 0);

    default:
      return 0;
  }
}
