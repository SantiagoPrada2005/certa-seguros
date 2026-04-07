import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const reminderCreateSchema = z.object({
  type: z.enum(["RENOVACION_SOAT", "RENOVACION_POLIZA", "SEGUIMIENTO_ARL", "LLAMADA", "VISITA", "OTRO"]),
  priority: z.enum(["INMEDIATA", "CRITICA", "ALTA", "MEDIA", "BAJA"]).optional().default("MEDIA"),
  status: z.enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO", "VENCIDO"]).optional().default("PENDIENTE"),
  dueDate: z.string().transform((str) => new Date(str)),
  description: z.string().optional(),
  clientId: z.string().min(1, "Client ID is required"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        client: true,
      },
      orderBy: [
        { dueDate: "asc" },
        { priority: "asc" },
      ],
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = reminderCreateSchema.parse(body);

    const reminder = await prisma.reminder.create({
      data: validatedData,
    });

    // Log creating reminder
    await prisma.activityLog.create({
      data: {
        action: `Recordatorio programado: ${reminder.type.replace(/_/g, ' ')}`,
        type: "INFO",
        clientId: reminder.clientId,
      }
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
