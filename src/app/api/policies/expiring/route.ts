import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    
    const today = new Date();
    const futureDate = addDays(today, days);

    const policies = await prisma.policy.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lte: futureDate,
          gte: today,
        },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: {
        endDate: "asc",
      },
    });

    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error fetching expiring policies:", error);
    return NextResponse.json(
      { error: "Failed to fetch expiring policies" },
      { status: 500 }
    );
  }
}
