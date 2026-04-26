import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getOrCreateInvoiceToken } from "@/lib/invoice/verification";
import { generateQRDataURL } from "@/lib/invoice/qr-generator";

const invoiceCreateSchema = z.object({
  number: z.string().min(1, "Invoice number is required"),
  date: z.string().transform((str) => new Date(str)),
  dueDate: z.string().transform((str) => new Date(str)),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).optional().default(0),
  discountDescription: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional().default(0.19),
  taxAmount: z.number().min(0),
  total: z.number().min(0),
  status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE"]).optional().default("DRAFT"),
  notes: z.string().optional(),
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

    const invoicesRaw = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        items: true,
      },
      orderBy: { date: "desc" },
    });

    const invoices = await Promise.all(invoicesRaw.map(async (inv) => {
      const token = await getOrCreateInvoiceToken(inv.id);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seguroscerta.com';
      const qrUrl = token ? `${baseUrl}/factura/${token}` : `${baseUrl}/factura/${inv.id}`;
      const qrDataURL = await generateQRDataURL(qrUrl);
      
      return {
        ...inv,
        subtotal: Number(inv.subtotal),
        discountAmount: Number(inv.discountAmount),
        taxRate: Number(inv.taxRate),
        taxAmount: Number(inv.taxAmount),
        total: Number(inv.total),
        items: inv.items.map(item => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
        verificationToken: token,
        qrDataURL,
      };
    }));

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = invoiceCreateSchema.parse(body);

    const { items, ...invoiceData } = validatedData;

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
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
        action: `Nueva factura creada: ${invoice.number}`,
        type: "INFO",
        clientId: invoice.clientId,
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
