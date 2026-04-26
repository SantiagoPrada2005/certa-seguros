import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

const TOKEN_EXPIRY_DAYS = 90;

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export async function getOrCreateInvoiceToken(invoiceId: string): Promise<string> {
  const existing = await prisma.invoiceVerification.findFirst({
    where: {
      invoiceId,
      expiresAt: { gt: new Date() },
    },
  });

  if (existing) {
    return existing.token;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.invoiceVerification.create({
    data: {
      token,
      invoiceId,
      expiresAt,
    },
  });

  return token;
}

export async function getInvoiceByToken(token: string) {
  return prisma.invoiceVerification.findUnique({
    where: { token },
    include: {
      invoice: {
        include: {
          client: true,
          items: true,
        },
      },
    },
  });
}

export async function getInvoiceById(invoiceId: string) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      items: true,
    },
  });
}