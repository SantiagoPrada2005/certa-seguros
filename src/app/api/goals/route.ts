import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const period = searchParams.get("period");

    const where: any = { isActive: true };
    if (category && category !== "all") {
      where.category = category.toUpperCase();
    }
    if (period && period !== "all") {
      where.period = period.toUpperCase();
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        milestones: true,
      },
      orderBy: { endDate: "asc" },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}
