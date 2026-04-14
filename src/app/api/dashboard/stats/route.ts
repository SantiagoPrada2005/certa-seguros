import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Get recent activity
    const activityFeed = await prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { name: true, type: true }
        },
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    });

    // Get quick stats (totals)
    const [totalClients, totalProspects, activePolicies, monthlyRevenue, pendingReminders, prospectsByStatus] = await Promise.all([
      prisma.client.count({ where: { status: "ACTIVO" } }),
      prisma.prospect.count({ where: { status: { not: "DESCARTADO" } } }),
      prisma.policy.count({ where: { status: "ACTIVE" } }),
      prisma.invoice.aggregate({
        where: {
          status: "PAID",
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Start of current month
          }
        },
        _sum: { total: true }
      }),
      prisma.reminder.count({ where: { status: "PENDIENTE" } }),
      prisma.prospect.groupBy({
        by: ["status"],
        _count: { _all: true },
      })
    ]);

    // Calculate conversion rate
    const convertedProspects = await prisma.prospect.count({ where: { status: "CONVERTIDO" } });
    const conversionRate = totalProspects > 0 ? Math.round((convertedProspects / totalProspects) * 100) : 0;

    // Build prospects breakdown map
    const prospectsBreakdown: Record<string, number> = {};
    prospectsByStatus.forEach(({ status, _count }) => {
      prospectsBreakdown[status] = _count._all;
    });

    return NextResponse.json({
      feed: activityFeed,
      stats: {
        totalClients,
        totalProspects,
        activePolicies,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        pendingReminders,
        conversionRate,
        prospectsBreakdown,
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
