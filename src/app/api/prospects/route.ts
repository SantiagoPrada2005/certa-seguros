import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const prospectCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INDIVIDUAL", "BUSINESS"]).optional(),
  documentType: z.enum(["CC", "NIT", "CE", "PASAPORTE", "TI", "RUT"]).optional(),
  documentNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "DESCARTADO", "CONVERTIDO"]).optional(),
  source: z.enum(["WEB_PUBLICA", "REFERIDOS", "REDES_SOCIALES", "DIRECTOS"]).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { documentNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const prospects = await prisma.prospect.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        services: {
          include: {
            service: true,
          }
        },
      }
    });

    return NextResponse.json(prospects);
  } catch (error) {
    console.error("Error fetching prospects:", error);
    return NextResponse.json(
      { error: "Failed to fetch prospects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = prospectCreateSchema.parse(body);

    const prospect = await prisma.prospect.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
    });

    // Implement a basic activity log
    await prisma.activityLog.create({
      data: {
        action: `Nuevo prospecto registrado: ${prospect.name}`,
        type: "INFO",
        prospectId: prospect.id,
      }
    });

    return NextResponse.json(prospect, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating prospect:", error);
    return NextResponse.json(
      { error: "Failed to create prospect" },
      { status: 500 }
    );
  }
}
