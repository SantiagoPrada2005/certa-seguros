import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const prospectUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.enum(["INDIVIDUAL", "BUSINESS"]).optional(),
  documentType: z.enum(["CC", "NIT", "CE", "PASAPORTE", "TI", "RUT"]).optional(),
  documentNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "ACTIVO", "INACTIVO", "DESCARTADO"]).optional(),
  source: z.enum(["WEB_PUBLICA", "REFERIDOS", "REDES_SOCIALES", "DIRECTOS"]).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const prospect = await prisma.prospect.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true,
          }
        },
        reminders: true,
      }
    });

    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    return NextResponse.json(prospect);
  } catch (error) {
    console.error("Error fetching prospect details:", error);
    return NextResponse.json(
      { error: "Failed to fetch prospect" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const validatedData = prospectUpdateSchema.parse(body);

    const prospect = await prisma.prospect.update({
      where: { id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
    });

    return NextResponse.json(prospect);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error updating prospect:", error);
    return NextResponse.json(
      { error: "Failed to update prospect" },
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

    // Log the deletion before removing the prospect
    await prisma.activityLog.create({
      data: {
        action: `Prospecto eliminado`,
        type: "WARNING",
      }
    });

    await prisma.prospect.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prospect:", error);
    return NextResponse.json(
      { error: "Failed to delete prospect" },
      { status: 500 }
    );
  }
}
