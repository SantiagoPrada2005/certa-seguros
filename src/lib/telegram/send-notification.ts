import prisma from "@/lib/prisma";
import { sendTelegramNotificationToChat } from "@/lib/telegram/bot";

interface NotificationPayload {
  userId: string;
  text: string;
}

/**
 * Envía una notificación proactiva a un usuario del CRM via Telegram.
 * Útil para llamar desde server actions después de crear
 * recordatorios, cambios de estado, etc.
 *
 * Ejemplo:
 *   await sendNotification({
 *     userId: "user_abc123",
 *     text: "⏰ *Nuevo recordatorio*\n\nSe ha creado un recordatorio de renovación SOAT para Juan Pérez.",
 *   });
 */
export async function sendNotification({ userId, text }: NotificationPayload): Promise<boolean> {
  try {
    const connection = await prisma.telegramConnection.findFirst({
      where: { userId, isActive: true },
    });

    if (!connection) return false;

    return await sendTelegramNotificationToChat(connection.chatId, text);
  } catch (error) {
    console.error("sendNotification error:", error);
    return false;
  }
}

/**
 * Envía una notificación a todos los usuarios vinculados a Telegram.
 */
export async function broadcastNotification(text: string): Promise<number> {
  try {
    const connections = await prisma.telegramConnection.findMany({
      where: { isActive: true },
    });

    let sent = 0;
    for (const conn of connections) {
      try {
        await sendTelegramNotificationToChat(conn.chatId, text);
        sent++;
      } catch (err) {
        console.error(`Error sending broadcast to ${conn.telegramId}:`, err);
      }
    }
    return sent;
  } catch (error) {
    console.error("broadcastNotification error:", error);
    return 0;
  }
}
