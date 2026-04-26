"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import type { $Enums } from "@/generated/prisma";
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
  birthDate: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["ACTIVO", "INACTIVO", "MOROSO"]).optional(),
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

const serviceUpdateSchema = z.object({
  name: z.string().min(1, "Nombre requerido").optional(),
  description: z.string().optional(),
  validityType: z.enum(["UNICA_VEZ", "ANUAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL"]).optional(),
  price: z.coerce.number().optional().nullable(),
  priceDescription: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  subcategoryId: z.string().min(1, "Subcategoría requerida").optional(),
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
  clientId: z.string().optional(),
  prospectId: z.string().optional(),
}).refine((data) => {
  if (!data.clientId && !data.prospectId) {
    return false;
  }
  return true;
}, { message: "Cliente o prospecto requerido" });

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
        birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Nuevo cliente registrado: ${client.name}`,
        type: "INFO",
        clientId: client.id,
      },
    });

    revalidatePath("/admin/clientes");
    return { success: true, data: { id: client.id } };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("createClient error:", err);
    return { success: false, error: "No se pudo crear el cliente" };
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

export async function updateService(
  id: string,
  data: z.infer<typeof serviceUpdateSchema>
): Promise<ActionResult> {
  try {
    const validated = serviceUpdateSchema.parse(data);
    await prisma.service.update({
      where: { id },
      data: validated,
    });

    await prisma.activityLog.create({
      data: {
        action: `Servicio actualizado: ${validated.name ?? id}`,
        type: "INFO",
      },
    });

    revalidatePath("/admin/servicios");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    console.error("updateService error:", err);
    return { success: false, error: "No se pudo actualizar el servicio" };
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
        type: validated.type,
        priority: validated.priority,
        status: validated.status,
        dueDate: new Date(validated.dueDate),
        description: validated.description,
        clientId: validated.clientId || null,
        prospectId: validated.prospectId || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Recordatorio programado: ${reminder.type.replace(/_/g, " ")}`,
        type: "INFO",
        clientId: reminder.clientId,
        prospectId: reminder.prospectId,
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

// ─── Automatic Goal Progress Recalculation ─────────────────────────────────

export async function recalculateGoalProgress(goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { milestones: true },
  });
  if (!goal) throw new Error("Goal not found");
  if (!goal.isActive) return null;

  // 1. Live-calculate current value using existing function
  const currentValue = await calculateGoalProgress({
    category: goal.category,
    unit: goal.unit,
    startDate: goal.startDate,
    endDate: goal.endDate,
  });

  // 2. Calculate previous period value for trend
  const periodLength =
    goal.endDate.getTime() - goal.startDate.getTime();
  const prevStart = new Date(goal.startDate.getTime() - periodLength);
  const prevEnd = new Date(goal.startDate.getTime() - 1);

  const previousValue = await calculateGoalProgress({
    category: goal.category,
    unit: goal.unit,
    startDate: prevStart,
    endDate: prevEnd,
  });

  // 3. Compute percentage, status, trend
  const target = Number(goal.targetValue);
  const percentage = target === 0 ? 0 : (currentValue / target) * 100;

  let status: $Enums.GoalStatus;
  if (percentage >= 100) status = "COMPLETED";
  else if (percentage >= 70) status = "ON_TRACK";
  else if (percentage >= 40) status = "AT_RISK";
  else status = "BEHIND";

  const trend =
    previousValue === 0
      ? 0
      : Math.round(
          ((currentValue - previousValue) / previousValue) * 100
        );

  // Cap trend to Decimal(5,2) range
  const clampedTrend = Math.max(-999.99, Math.min(999.99, trend));

  // 4. Persist everything in a transaction
  await prisma.$transaction([
    prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue,
        status,
        trend: clampedTrend,
      },
    }),
    ...goal.milestones.map((m) =>
      prisma.goalMilestone.update({
        where: { id: m.id },
        data: { reached: currentValue >= Number(m.value) },
      })
    ),
  ]);

  revalidatePath("/admin/metas");

  return { currentValue, status, trend: clampedTrend, percentage };
}

export async function recalculateAllGoalsProgress() {
  const goals = await prisma.goal.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    goals.map((g) => recalculateGoalProgress(g.id))
  );

  const succeeded = results.filter(
    (r) => r.status === "fulfilled"
  ).length;
  const failed = results.filter(
    (r) => r.status === "rejected"
  ).length;

  return { total: goals.length, succeeded, failed };
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

// ─── Dashboard Charts Actions ──────────────────────────────────────────────────

export async function getDashboardChartData() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0,0,0,0);

  // 1. Revenue (Primas y comisiones por mes)
  const policies = await prisma.policy.findMany({
    where: { startDate: { gte: startOfYear } },
    select: { startDate: true, premiumAmount: true, commissionAmount: true },
  });

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const revenueDataMap = new Map();
  months.forEach(m => revenueDataMap.set(m, { month: m, primas: 0, comisiones: 0 }));

  policies.forEach(p => {
    const monthName = months[p.startDate.getMonth()];
    const current = revenueDataMap.get(monthName);
    current.primas += Number(p.premiumAmount);
    current.comisiones += Number(p.commissionAmount);
  });
  const revenueData = Array.from(revenueDataMap.values());

  // 2. Service Distribution (Pólizas por tipo)
  const serviceDistributionDist = await prisma.policy.groupBy({
    by: ["type"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
  });
  
  const typeColors: Record<string, string> = {
    SOAT: "var(--color-primary)",
    VEHICULAR: "var(--color-chart-2)",
    VIDA: "var(--color-chart-3)",
    ARL: "var(--color-chart-4)",
    TODO_RIESGO: "var(--color-chart-5)",
  };

  const serviceDistributionData = serviceDistributionDist.map(s => ({
    servicio: s.type,
    cantidad: s._count._all,
    fill: typeColors[s.type] || "var(--color-muted)",
  }));

  // 3. Lead Sources (only prospects, not clients)
  const leadSourcesDist = await prisma.prospect.groupBy({
    by: ["source"],
    where: { source: { not: null } },
    _count: { _all: true },
  });

  const sourceColors: Record<string, string> = {
    WEB_PUBLICA: "var(--color-primary)",
    REFERIDOS: "var(--color-chart-2)",
    REDES_SOCIALES: "var(--color-chart-3)",
    DIRECTOS: "var(--color-chart-4)",
  };
  const sourceNames: Record<string, string> = {
    WEB_PUBLICA: "Web Pública",
    REFERIDOS: "Referidos",
    REDES_SOCIALES: "Redes Sociales",
    DIRECTOS: "Directos",
  };

  const leadSourcesData = leadSourcesDist.map(s => ({
    fuente: sourceNames[s.source!] || s.source,
    valor: s._count._all,
    fill: sourceColors[s.source!] || "var(--color-muted)",
  }));

  // 4. Conversion Rate (prospects → clients)
  const totalProspects = await prisma.prospect.count();
  const convertedProspects = await prisma.prospect.count({ where: { status: "CONVERTIDO" } });
  const conversionRate = totalProspects > 0 ? Math.round((convertedProspects / totalProspects) * 100) : 0;
  const conversionData = [{ name: "Conversión", valor: conversionRate, fill: "var(--color-primary)" }];

  // 5. Weekly Activity
  const recentLogs = await prisma.activityLog.findMany({
    where: { createdAt: { gte: startOfWeek } },
    select: { createdAt: true, type: true }
  });

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const weeklyMap = new Map();
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  weekDays.forEach(d => weeklyMap.set(d, { dia: d, contactados: 0, nuevos: 0, cerrados: 0 }));

  recentLogs.forEach(log => {
    const dayName = days[log.createdAt.getDay()];
    if (weeklyMap.has(dayName)) {
      const current = weeklyMap.get(dayName);
      if (log.type === "INFO") current.contactados++;
      if (log.type === "WARNING") current.nuevos++;
      if (log.type === "SUCCESS") current.cerrados++;
    }
  });
  const weeklyActivityData = Array.from(weeklyMap.values());

  return {
    revenueData,
    serviceDistributionData,
    leadSourcesData,
    conversionData,
    weeklyActivityData,
  };
}

// ─── Unified Dashboard Data ────────────────────────────────────────────────────

export interface WeeklyActivity {
  dia: string;
  nuevos: number;
  gestiones: number;
  cerrados: number;
}

export interface DashboardData {
  feed: {
    id: string;
    action: string;
    type: string;
    createdAt: Date;
    client: { name: string; type: string } | null;
  }[];
  stats: {
    totalClients: number;
    totalProspects: number;
    activePolicies: number;
    monthlyRevenue: number;
    pendingReminders: number;
    conversionRate: number;
    prospectsBreakdown: Record<string, number>;
  };
  revenueData: { month: string; primas: number; comisiones: number }[];
  serviceDistributionData: { servicio: string; cantidad: number; fill: string }[];
  leadSourcesData: { fuente: string; valor: number; fill: string }[];
  conversionData: { name: string; valor: number; fill: string }[];
  weeklyActivityData: WeeklyActivity[];
  goalsData: {
    id: string;
    name: string;
    current: number;
    goal: number;
    unit: string;
    percentage: number;
  }[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Reset startOfWeek to Monday 00:00:00
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  // End of week (Sunday 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const [
    activityFeed,
    totalClients,
    totalProspects,
    activePolicies,
    monthlyRevenue,
    pendingReminders,
    prospectsByStatus,
    policies,
    serviceDistributionDist,
    leadSourcesDist,
    goals,
    weeklyProspectActivity,
  ] = await Promise.all([
    // 1. Feed
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true, type: true } } },
    }),
    // 2. Active clients
    prisma.client.count({ where: { status: "ACTIVO" } }),
    // 3. Non-descarted prospects
    prisma.prospect.count({ where: { status: { not: "DESCARTADO" }, deletedAt: null } }),
    // 4. Active policies
    prisma.policy.count({ where: { status: "ACTIVE" } }),
    // 5. Monthly revenue
    prisma.invoice.aggregate({
      where: { status: "PAID", date: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    // 6. Pending reminders
    prisma.reminder.count({ where: { status: "PENDIENTE" } }),
    // 7. Prospects by status
    prisma.prospect.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    // 8. All policies this year (for revenue chart)
    prisma.policy.findMany({
      where: { startDate: { gte: startOfYear } },
      select: { startDate: true, premiumAmount: true, commissionAmount: true },
    }),
    // 9. Active policies by type
    prisma.policy.groupBy({
      by: ["type"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
    // 10. Lead sources
    prisma.prospect.groupBy({
      by: ["source"],
      where: { source: { not: null }, deletedAt: null },
      _count: { _all: true },
    }),
    // 11. Active goals
    prisma.goal.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    // 12. Weekly prospect activity
    prisma.activityLog.findMany({
      where: {
        createdAt: { gte: startOfWeek, lte: endOfWeek },
        prospectId: { not: null },
      },
      select: { createdAt: true },
    }),
  ]);

  // --- Process revenue chart ---
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const revenueDataMap = new Map<string, { month: string; primas: number; comisiones: number }>();
  months.forEach((m) => revenueDataMap.set(m, { month: m, primas: 0, comisiones: 0 }));
  policies.forEach((p) => {
    const monthName = months[p.startDate.getMonth()];
    const current = revenueDataMap.get(monthName)!;
    current.primas += Number(p.premiumAmount);
    current.comisiones += Number(p.commissionAmount);
  });
  const revenueData = Array.from(revenueDataMap.values());

  // --- Process service distribution ---
  const typeColors: Record<string, string> = {
    SOAT: "var(--color-primary)",
    VEHICULAR: "var(--color-chart-2)",
    VIDA: "var(--color-chart-3)",
    ARL: "var(--color-chart-4)",
    TODO_RIESGO: "var(--color-chart-5)",
  };
  const serviceDistributionData = serviceDistributionDist.map((s) => ({
    servicio: s.type,
    cantidad: s._count._all,
    fill: typeColors[s.type] || "var(--color-muted)",
  }));

  // --- Process lead sources ---
  const sourceColors: Record<string, string> = {
    WEB_PUBLICA: "var(--color-primary)",
    REFERIDOS: "var(--color-chart-2)",
    REDES_SOCIALES: "var(--color-chart-3)",
    DIRECTOS: "var(--color-chart-4)",
  };
  const sourceNames: Record<string, string> = {
    WEB_PUBLICA: "Web Pública",
    REFERIDOS: "Referidos",
    REDES_SOCIALES: "Redes Sociales",
    DIRECTOS: "Directos",
  };
  const leadSourcesData = leadSourcesDist
    .filter((s) => s.source !== null)
    .map((s) => ({
      fuente: sourceNames[s.source!] || s.source!,
      valor: s._count._all,
      fill: sourceColors[s.source!] || "var(--color-muted)",
    }));

  // --- Process conversion ---
  const convertedFromGroupBy = prospectsByStatus.find((s) => s.status === "CONVERTIDO")?._count._all || 0;
  const totalAllProspects = prospectsByStatus.reduce((sum, s) => sum + s._count._all, 0);
  const conversionRate = totalAllProspects > 0 ? Math.round((convertedFromGroupBy / totalAllProspects) * 100) : 0;
  const conversionData = [{ name: "Conversión", valor: conversionRate, fill: "var(--color-primary)" }];

  // --- Process weekly activity (FIXED semantic mapping) ---
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const weeklyMap = new Map<string, WeeklyActivity>();
  weekDays.forEach((d) => weeklyMap.set(d, { dia: d, nuevos: 0, gestiones: 0, cerrados: 0 }));

  const weekDayStartEnd = weekDays.map((_, i) => {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(dayStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return { dayStart, dayEnd };
  });

  const weeklyCounts = await Promise.all(
    weekDayStartEnd.flatMap(({ dayStart, dayEnd }) => [
      prisma.prospect.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd }, deletedAt: null },
      }),
      prisma.prospect.count({
        where: {
          updatedAt: { gte: dayStart, lte: dayEnd },
          status: { in: ["CONVERTIDO", "DESCARTADO"] },
          deletedAt: null,
        },
      }),
    ])
  );

  for (let i = 0; i < 7; i++) {
    const dayName = weekDays[i];
    const entry = weeklyMap.get(dayName)!;
    entry.nuevos = weeklyCounts[i * 2];
    entry.cerrados = weeklyCounts[i * 2 + 1];
  }

  // "Gestiones": ActivityLog entries per day with prospectId
  weeklyProspectActivity.forEach((log) => {
    const dayName = days[log.createdAt.getDay()];
    if (weeklyMap.has(dayName)) {
      weeklyMap.get(dayName)!.gestiones++;
    }
  });

  const weeklyActivityData = Array.from(weeklyMap.values());

  // --- Process goals with real progress ---
  const goalsData = await Promise.all(
    goals.map(async (goal) => {
      const current = await calculateGoalProgress(goal);
      return {
        id: goal.id,
        name: goal.name,
        current: current,
        goal: Number(goal.targetValue),
        unit: goal.unit,
        percentage: Math.min(Math.round((current / Number(goal.targetValue)) * 100), 100),
      };
    })
  );

  // --- Build prospects breakdown ---
  const prospectsBreakdown: Record<string, number> = {};
  prospectsByStatus.forEach(({ status, _count }) => {
    if (status !== "DESCARTADO") {
      prospectsBreakdown[status] = _count._all;
    }
  });

  return {
    feed: activityFeed.map((f) => ({
      id: f.id,
      action: f.action,
      type: f.type,
      createdAt: f.createdAt,
      client: f.client,
    })),
    stats: {
      totalClients,
      totalProspects,
      activePolicies,
      monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
      pendingReminders,
      conversionRate,
      prospectsBreakdown,
    },
    revenueData,
    serviceDistributionData,
    leadSourcesData,
    conversionData,
    weeklyActivityData,
    goalsData,
  };
}

// ─── Fetch Actions for Forms ───────────────────────────────────────────────────

export async function getServicesForInvoicing() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { subcategory: { include: { category: true } } },
      orderBy: { name: "asc" }
    });
    
    const serializedServices = services.map(s => ({
      ...s,
      price: s.price ? Number(s.price) : null
    }));

    return { success: true, data: serializedServices };
  } catch (error) {
    console.error("getServicesForInvoicing error:", error);
    return { success: false, error: "Error obteniendo servicios" };
  }
}

export async function getClientsForInvoicing() {
  try {
    const clients = await prisma.client.findMany({
      where: { status: "ACTIVO" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, documentType: true, documentNumber: true, email: true }
    });
    return { success: true, data: clients };
  } catch (error) {
    console.error("getClientsForInvoicing error:", error);
    return { success: false, error: "Error obteniendo clientes" };
  }
}

export async function getProspectsForInvoicing() {
  try {
    const prospects = await prisma.prospect.findMany({
      where: { status: { not: "DESCARTADO" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, documentType: true, documentNumber: true, email: true }
    });
    return { success: true, data: prospects };
  } catch (error) {
    console.error("getProspectsForInvoicing error:", error);
    return { success: false, error: "Error obteniendo prospectos" };
  }
}
