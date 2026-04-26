import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getDashboardSummaryTool = tool({
  description:
    "Obtener un resumen ejecutivo del estado actual del negocio: conteo de clientes, prospectos, pólizas, facturas vencidas, recordatorios pendientes y metas.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const [
        totalClients,
        activeClients,
        morosoClients,
        totalProspects,
        newProspects,
        activePolicies,
        expiringPolicies,
        overdueInvoices,
        pendingInvoices,
        pendingReminders,
        overdueReminders,
        goalsOnTrack,
      ] = await Promise.all([
        prisma.client.count(),
        prisma.client.count({ where: { status: "ACTIVO" } }),
        prisma.client.count({ where: { status: "MOROSO" } }),
        prisma.prospect.count({ where: { deletedAt: null } }),
        prisma.prospect.count({
          where: { deletedAt: null, status: "NUEVO" },
        }),
        prisma.policy.count({ where: { status: "ACTIVE" } }),
        prisma.policy.count({
          where: {
            endDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            status: { in: ["ACTIVE", "PENDING_RENEWAL"] },
          },
        }),
        prisma.invoice.count({
          where: { status: { in: ["OVERDUE", "PENDING"] } },
        }),
        prisma.invoice.count({ where: { status: "PENDING" } }),
        prisma.reminder.count({ where: { status: "PENDIENTE" } }),
        prisma.reminder.count({
          where: {
            status: "PENDIENTE",
            dueDate: { lt: new Date() },
          },
        }),
        prisma.goal.count({
          where: { isActive: true, status: { in: ["ON_TRACK", "COMPLETED", "EXCEEDED"] } },
        }),
      ]);

      return {
        summary: {
          clients: {
            total: totalClients,
            active: activeClients,
            moroso: morosoClients,
          },
          prospects: {
            total: totalProspects,
            new: newProspects,
          },
          policies: {
            active: activePolicies,
            expiringSoon: expiringPolicies,
          },
          invoices: {
            overdue: overdueInvoices,
            pending: pendingInvoices,
          },
          reminders: {
            pending: pendingReminders,
            overdue: overdueReminders,
          },
          goals: {
            onTrack: goalsOnTrack,
          },
        },
      };
    } catch (e: any) {
      return { error: `Error al obtener resumen: ${e.message}` };
    }
  },
});
