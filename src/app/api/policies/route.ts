import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const policyCreateSchema = z.object({
  policyNumber: z.string().min(1, "Policy number is required"),
  type: z.enum(["SOAT", "VEHICULAR", "VIDA", "ARL", "TODO_RIESGO", "SALUD", "OTRO"]),
  premiumAmount: z.number().min(0),
  commissionAmount: z.number().min(0).optional().default(0),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING_RENEWAL"]).optional().default("ACTIVE"),
  clientId: z.string().min(1, "Client ID is required"),
  serviceId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = policyCreateSchema.parse(body);

    const policy = await prisma.policy.create({
      data: validatedData,
    });

    await prisma.activityLog.create({
      data: {
        action: `Nueva póliza emitida: ${policy.policyNumber} (${policy.type})`,
        type: "SUCCESS",
        clientId: policy.clientId,
      }
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating policy:", error);
    return NextResponse.json(
      { error: "Failed to create policy" },
      { status: 500 }
    );
  }
}
