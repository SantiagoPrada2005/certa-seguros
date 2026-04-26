import { sendDailyDigest } from "@/lib/telegram/bot";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

/**
 * Endpoint para el resumen diario matutino.
 *
 * Llamada programada (Vercel Cron Jobs, cron-job.org, etc.):
 *   GET /api/telegram/digest
 *
 * Protegido por un API key simple para evitar accesos no autorizados.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const sent = await sendDailyDigest();
    return new Response(
      JSON.stringify({ success: true, notificationsSent: sent }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Daily digest error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
