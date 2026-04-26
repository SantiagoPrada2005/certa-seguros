import { getWebhookHandler } from "@/lib/telegram/bot";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const handler = getWebhookHandler();
  try {
    const response = await handler(req);
    return response;
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return new Response("OK", { status: 200 });
  }
}

/**
 * Endpoint para activar/desactivar el webhook en la API de Telegram.
 * Útil para configuración inicial.
 *
 * Usage:
 *   GET /api/telegram/webhook?setup=1&url=https://tudominio.com/api/telegram/webhook
 *   GET /api/telegram/webhook?remove=1
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const setup = searchParams.get("setup");
  const remove = searchParams.get("remove");
  const info = searchParams.get("info");

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (info === "1") {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const data = await response.json();
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (setup && TELEGRAM_BOT_TOKEN) {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: setup,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (remove === "1" && TELEGRAM_BOT_TOKEN) {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
    );
    const data = await response.json();
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    "Telegram Webhook Endpoint\n\n" +
      "Usage:\n" +
      "  GET ?setup=https://domain.com/api/telegram/webhook - Set webhook\n" +
      "  GET ?remove=1 - Remove webhook\n" +
      "  GET ?info=1 - Get webhook info",
    { headers: { "Content-Type": "text/plain" } }
  );
}
