import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateGoalCurrentValue, determineGoalStatus } from "@/lib/goal-calculator";

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

    // Update goals based on calculated progress
    const updatedGoals = await Promise.all(
      goals.map(async (goal) => {
        try {
          const currentValue = await calculateGoalCurrentValue(goal);
          const status = determineGoalStatus(
            currentValue,
            Number(goal.targetValue),
            goal.startDate,
            goal.endDate
          );

          // Only update if there are changes
          if (
            currentValue !== Number(goal.currentValue) ||
            status !== goal.status
          ) {
            const updatedGoal = await prisma.goal.update({
              where: { id: goal.id },
              data: {
                currentValue,
                status,
              },
              include: {
                milestones: true,
              },
            });
            return updatedGoal;
          }

          return goal;
        } catch (error) {
          console.error(`Error recalculating goal ${goal.id}:`, error);
          return goal;
        }
      })
    );

    return NextResponse.json(updatedGoals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}
