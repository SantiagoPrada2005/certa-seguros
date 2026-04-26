import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const paymentRequestCreateSchema = z.object({
  number: z.string().min(1, "Number is required"),
  date: z.string().transform((str) => new Date(str)),
  dueDate: z.string().transform((str) => new Date(str)),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).optional().default(0),
  discountDescription: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional().default(0),
  taxAmount: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  status: z.enum(["DRAFT", "PENDING", "PAID", "CANCELLED"]).optional().default("DRAFT"),
  notes: z.string().optional(),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  accountNumber: z.string().optional(),
  clientId: z.string().min(1, "Client ID is required"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Item description is required"),
      quantity: z.number().int().min(1).optional().default(1),
      unitPrice: z.number().min(0),
      total: z.number().min(0),
    })
  ).min(1, "At least one item is required"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const prsRaw = await prisma.paymentRequest.findMany({
      where,
      include: {
        client: true,
        items: true,
      },
      orderBy: { date: "desc" },
    });

    const prs = prsRaw.map(pr => ({
      ...pr,
      subtotal: Number(pr.subtotal),
      discountAmount: Number(pr.discountAmount),
      taxRate: Number(pr.taxRate),
      taxAmount: Number(pr.taxAmount),
      total: Number(pr.total),
      items: pr.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
    }));

    return NextResponse.json(prs);
  } catch (error) {
    console.error("Error fetching payment requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = paymentRequestCreateSchema.parse(body);

    const { items, ...prData } = validatedData;

    const pr = await prisma.paymentRequest.create({
      data: {
        ...prData,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: `Nueva cuenta de cobro creada: ${pr.number}`,
        type: "INFO",
        clientId: pr.clientId,
      }
    });

    return NextResponse.json(pr, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating payment request:", error);
    return NextResponse.json(
      { error: "Failed to create payment request" },
      { status: 500 }
    );
  }
}
