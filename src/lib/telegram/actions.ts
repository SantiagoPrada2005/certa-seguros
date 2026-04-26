"use server";

import prisma from "@/lib/prisma";
import { generateVerificationCode } from "@/lib/telegram/qrcode-utils";
import { getCurrentUser } from "@/lib/telegram/get-auth-user";

const CODE_EXPIRY_MINUTES = 15;

function requireUser() {
  const userPromise = getCurrentUser();
  return async <T>(fn: (userId: string) => Promise<T>): Promise<T> => {
    const user = await userPromise;
    if (!user) throw new Error("No autenticado");
    return fn(user.id);
  };
}

/**
 * Genera un nuevo código de verificación para vincular Telegram.
 * Invalida cualquier código previo no usado del mismo usuario.
 */
export async function generateTelegramCode(): Promise<{
  code: string;
  expiresAt: Date;
}> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  // Invalidar códigos anteriores no usados
  await prisma.telegramVerificationCode.updateMany({
    where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    data: { used: true },
  });

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  await prisma.telegramVerificationCode.create({
    data: { code, userId: user.id, expiresAt },
  });

  return { code, expiresAt };
}

/**
 * Obtiene el estado actual de vinculación de Telegram del usuario autenticado.
 */
export async function getTelegramStatus(): Promise<
  | { linked: false }
  | { linked: true; username: string | null; linkedAt: Date }
> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  const connection = await prisma.telegramConnection.findUnique({
    where: { userId: user.id },
  });

  if (!connection) return { linked: false };

  return { linked: true, username: connection.username, linkedAt: connection.linkedAt };
}

/**
 * Desvincula la cuenta de Telegram del usuario autenticado.
 */
export async function disconnectTelegram() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  await prisma.telegramConnection.delete({ where: { userId: user.id } });
}

/**
 * Obtiene el código activo actual del usuario (para mostrar en QR).
 */
export async function getActiveCode(): Promise<{
  code: string;
  expiresAt: Date;
} | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  const record = await prisma.telegramVerificationCode.findFirst({
    where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return null;
  return { code: record.code, expiresAt: record.expiresAt };
}

/**
 * Verifica si el usuario ya vinculó su Telegram (para polling desde la página).
 */
export async function checkTelegramLinked(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const connection = await prisma.telegramConnection.findUnique({
    where: { userId: user.id },
  });
  return !!connection;
}
