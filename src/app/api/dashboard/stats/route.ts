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
    const [totalClients, activePolicies, monthlyRevenue, pendingReminders] = await Promise.all([
      prisma.client.count({ where: { status: "ACTIVO" } }),
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
      prisma.reminder.count({ where: { status: "PENDIENTE" } })
    ]);

    return NextResponse.json({
      feed: activityFeed,
      stats: {
        totalClients,
        activePolicies,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        pendingReminders
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
