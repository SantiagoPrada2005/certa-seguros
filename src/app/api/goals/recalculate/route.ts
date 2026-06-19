import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { recalculateAllGoalsProgress } = await import(
      "@/app/admin/actions"
    );
    const result = await recalculateAllGoalsProgress();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error recalculating goals:", error);
    return NextResponse.json(
      { error: "Failed to recalculate goals" },
      { status: 500 }
    );
  }
}
