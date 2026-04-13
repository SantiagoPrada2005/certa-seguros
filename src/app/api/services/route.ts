import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const serviceCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  validityType: z.enum(["UNICA_VEZ", "ANUAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL"]).optional(),
  price: z.number().optional().nullable(),
  priceDescription: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  subcategoryId: z.string().optional(),
});

const serviceUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  validityType: z.enum(["UNICA_VEZ", "ANUAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL"]).optional(),
  price: z.number().optional().nullable(),
  priceDescription: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  subcategoryId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get("grouped") === "true";

    if (grouped) {
      const categories = await prisma.serviceCategory.findMany({
        include: {
          subcategories: {
            include: {
              services: {
                where: { isActive: true }
              }
            }
          }
        }
      });
      return NextResponse.json(categories);
    }

    const services = await prisma.service.findMany({
      include: {
        subcategory: {
          include: {
            category: true,
          }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = serviceCreateSchema.parse(body);

    const service = await prisma.service.create({
      data: validatedData,
    });

    await prisma.activityLog.create({
      data: {
        action: `Nuevo servicio agregado al catálogo: ${service.name}`,
        type: "INFO",
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = serviceUpdateSchema.parse(body);

    const service = await prisma.service.update({
      where: { id },
      data: validatedData,
    });

    await prisma.activityLog.create({
      data: {
        action: `Servicio actualizado: ${service.name}`,
        type: "INFO",
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}
