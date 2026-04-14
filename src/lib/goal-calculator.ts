import prisma from "./prisma";
import { Goal, GoalStatus } from "@/generated/prisma/client";

export async function calculateGoalCurrentValue(goal: Goal): Promise<number> {
  const { category, unit, startDate, endDate } = goal;

  let currentValue = 0;

  switch (category) {
    case "VENTAS":
      if (unit.toUpperCase() === "COP") {
        const result = await prisma.policy.aggregate({
          _sum: { premiumAmount: true },
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        });
        currentValue = Number(result._sum.premiumAmount || 0);
      } else {
        currentValue = await prisma.policy.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        });
      }
      break;

    case "CLIENTES":
      currentValue = await prisma.client.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      });
      break;

    case "RENOVACIONES":
      // Buscar pólizas creadas en el rango que sean de clientes con pólizas previas del mismo tipo
      // Debido a la complejidad de esta query, la hacemos en varios pasos o con una query algo más estructurada.
      const renewals = await prisma.policy.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          clientId: true,
          type: true,
          premiumAmount: true,
        },
      });

      // Filtrar cuáles son renovaciones reales (el cliente tiene otra póliza más antigua del mismo tipo)
      const validRenewals = [];
      for (const policy of renewals) {
        const previousPolicy = await prisma.policy.findFirst({
          where: {
            clientId: policy.clientId,
            type: policy.type,
            createdAt: { lt: startDate },
            status: { in: ["EXPIRED", "CANCELLED", "ACTIVE"] }, // Asumimos que cualquier póliza previa del mismo tipo hace que la nueva sea renovación
            id: { not: policy.id }
          },
        });
        if (previousPolicy) {
          validRenewals.push(policy);
        }
      }

      if (unit.toUpperCase() === "COP") {
        currentValue = validRenewals.reduce((acc, p) => acc + Number(p.premiumAmount), 0);
      } else {
        currentValue = validRenewals.length;
      }
      break;

    case "INGRESOS":
      const invoicesResult = await prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          date: { gte: startDate, lte: endDate },
          status: "PAID",
        },
      });
      currentValue = Number(invoicesResult._sum.total || 0);
      break;
  }

  return currentValue;
}

export function determineGoalStatus(
  currentValue: number,
  targetValue: number,
  startDate: Date,
  endDate: Date
): GoalStatus {
  if (currentValue > targetValue) {
    return "EXCEEDED";
  }
  if (currentValue === targetValue) {
    return "COMPLETED";
  }

  const now = new Date();

  // Si la meta ya terminó y no se completó
  if (now > endDate) {
    return "BEHIND";
  }

  // Si la meta aún no empieza
  if (now < startDate) {
    return "ON_TRACK";
  }

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsedDuration = now.getTime() - startDate.getTime();
  const timeElapsedPercentage = elapsedDuration / totalDuration;

  const progressPercentage = currentValue / targetValue;

  // Calculamos qué porcentaje del progreso esperado llevamos
  // ej. Ha pasado el 50% del tiempo. Esperamos llevar el 50% de la meta.
  // Si llevamos 40%, el ratio es 40/50 = 0.8 (80% de lo esperado).
  const expectedProgressRatio = timeElapsedPercentage === 0 ? 1 : progressPercentage / timeElapsedPercentage;

  if (expectedProgressRatio >= 1) {
    return "ON_TRACK";
  } else if (expectedProgressRatio >= 0.7) {
    return "AT_RISK";
  } else {
    return "BEHIND";
  }
}
