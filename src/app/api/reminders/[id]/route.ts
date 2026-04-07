import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const reminderUpdateSchema = z.object({
  type: z.enum(["RENOVACION_SOAT", "RENOVACION_POLIZA", "SEGUIMIENTO_ARL", "LLAMADA", "VISITA", "OTRO"]).optional(),
  priority: z.enum(["INMEDIATA", "CRITICA", "ALTA", "MEDIA", "BAJA"]).optional(),
  status: z.enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO", "VENCIDO"]).optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  description: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const validatedData = reminderUpdateSchema.parse(body);

    const reminder = await prisma.reminder.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(reminder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    
    await prisma.reminder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
