import { Bot, Context, InlineKeyboard, webhookCallback } from "grammy";
import { generateText, isLoopFinished, stepCountIs } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import prisma from "@/lib/prisma";
import { TELEGRAM_SYSTEM_PROMPT } from "@/lib/ai/telegram-system-prompt";

// AI tools
import { getClientsTool } from "@/lib/tools/get-clients";
import { getClientDetailsTool } from "@/lib/tools/get-client-details";
import { getProspectsTool } from "@/lib/tools/get-prospects";
import { getProspectDetailsTool } from "@/lib/tools/get-prospect-details";
import { getClientTagsTool } from "@/lib/tools/get-client-tags";
import { getPoliciesTool } from "@/lib/tools/get-policies";
import { getPolicyDetailsTool } from "@/lib/tools/get-policy-details";
import { getExpiringPoliciesTool } from "@/lib/tools/get-expiring-policies";
import { getInvoicesTool } from "@/lib/tools/get-invoices";
import { getInvoiceDetailsTool } from "@/lib/tools/get-invoice-details";
import { getRemindersTool } from "@/lib/tools/get-reminders";
import { getRecentActivityTool } from "@/lib/tools/get-recent-activity";
import { getServicesTool } from "@/lib/tools/get-services";
import { getServiceDetailsTool } from "@/lib/tools/get-service-details";
import { getGoalsTool } from "@/lib/tools/get-goals";
import { getDashboardSummaryTool } from "@/lib/tools/get-dashboard-summary";
import { createReminderTool } from "@/lib/tools/create-reminder";
import { createProspectTool } from "@/lib/tools/create-prospect";
import { updateProspectStatusTool } from "@/lib/tools/update-prospect-status";
import { updateClientStatusTool } from "@/lib/tools/update-client-status";
import { updatePolicyStatusTool } from "@/lib/tools/update-policy-status";
import { convertProspectToClientTool } from "@/lib/tools/convert-prospect-to-client";
import { logActivityTool } from "@/lib/tools/log-activity";

const allTools = {
  get_clients: getClientsTool,
  get_client_details: getClientDetailsTool,
  get_prospects: getProspectsTool,
  get_prospect_details: getProspectDetailsTool,
  get_client_tags: getClientTagsTool,
  get_policies: getPoliciesTool,
  get_policy_details: getPolicyDetailsTool,
  get_expiring_policies: getExpiringPoliciesTool,
  get_invoices: getInvoicesTool,
  get_invoice_details: getInvoiceDetailsTool,
  get_reminders: getRemindersTool,
  get_recent_activity: getRecentActivityTool,
  get_services: getServicesTool,
  get_service_details: getServiceDetailsTool,
  get_goals: getGoalsTool,
  get_dashboard_summary: getDashboardSummaryTool,
  create_reminder: createReminderTool,
  create_prospect: createProspectTool,
  update_prospect_status: updateProspectStatusTool,
  update_client_status: updateClientStatusTool,
  update_policy_status: updatePolicyStatusTool,
  convert_prospect_to_client: convertProspectToClientTool,
  log_activity: logActivityTool,
};

const digestTools = {
  get_expiring_policies: getExpiringPoliciesTool,
  get_invoices: getInvoicesTool,
  get_reminders: getRemindersTool,
  get_dashboard_summary: getDashboardSummaryTool,
};

// ─── Lazy bot singleton ─────────────────────

let _bot: Bot<AuthedContext> | null = null;

function getBot(): Bot<AuthedContext> | null {
  if (_bot) return _bot;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  _bot = new Bot<AuthedContext>(token);
  setupBot(_bot);
  _bot.catch((err) => console.error("Bot error:", err));
  return _bot;
}

/** Modelo de AI */
function getModel() {
  const modelName = process.env.CHAT_MODEL || "google/gemini-2.5-flash";
  if (modelName.startsWith("openrouter/")) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");
    return createOpenAICompatible({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    })(modelName.replace("openrouter/", ""));
  }
  return gateway(modelName);
}

export interface AuthedContext extends Context {
  crmUserId?: string;
}

// ─── Bot setup ──────────────────────────────

function setupBot(bot: Bot<AuthedContext>) {
  bot.command("start", async (ctx) => {
    const connection = await prisma.telegramConnection.findUnique({
      where: { telegramId: String(ctx.from!.id) },
      include: { user: true },
    });

    if (connection) {
      await ctx.reply(
        `👋 ¡Hola de nuevo, ${connection.user.name}! Ya tienes tu cuenta vinculada.\n\nEnvíame cualquier consulta sobre el CRM o escribe /ayuda para ver los comandos disponibles.`,
        { reply_markup: mainMenuKeyboard() }
      );
      return;
    }

    await ctx.reply(
      "🤖 *Zap AI — Certa Seguros*\n\n" +
        "Soy el asistente inteligente del CRM. Para usarme, primero debes vincular tu cuenta.\n\n" +
        "1. Abre el dashboard de Certa Seguros\n" +
        "2. Ve a Configuración > Telegram\n" +
        "3. Genera un código de vinculación\n" +
        "4. Envíame ese código aquí\n\n" +
        "O simplemente escribe tu código de vinculación.",
      { parse_mode: "Markdown", reply_markup: verificationStartKeyboard() }
    );
  });

  bot.command("ayuda", async (ctx) => {
    await ctx.reply(
      "*Comandos disponibles:*\n\n" +
        "/start — Verificar estado de la cuenta\n" +
        "/ayuda — Mostrar esta ayuda\n" +
        "/cancelar — Cancelar operación actual\n" +
        "/menu — Mostrar menú principal\n\n" +
        "También puedes escribir en lenguaje natural:\n" +
        '• "¿Cómo va la empresa?"\n' +
        '• "Lista los clientes activos"\n' +
        '• "¿Qué pólizas están por vencer?"\n' +
        '• "Crea un recordatorio para Juan Pérez"',
      { parse_mode: "Markdown", reply_markup: mainMenuKeyboard() }
    );
  });

  bot.command("cancelar", async (ctx) => {
    await ctx.reply("✅ Operación cancelada.", { reply_markup: mainMenuKeyboard() });
  });

  bot.command("menu", async (ctx) => {
    await ctx.reply("¿Qué deseas hacer?", { reply_markup: mainMenuKeyboard() });
  });

  // Authentication middleware
  bot.use(async (ctx, next) => {
    if (ctx.message?.text?.startsWith("/start") || ctx.message?.text?.startsWith("/ayuda")) {
      await next();
      return;
    }
    if (ctx.callbackQuery) {
      await next();
      return;
    }

    const telegramId = String(ctx.from?.id);
    if (!telegramId) {
      await ctx.reply("Error: no se pudo identificar tu usuario de Telegram.");
      return;
    }

    const connection = await prisma.telegramConnection.findUnique({
      where: { telegramId },
    });

    if (!connection) {
      await ctx.reply(
        "❌ No tienes una cuenta vinculada. Usa /start para ver las instrucciones de vinculación.",
        { reply_markup: verificationStartKeyboard() }
      );
      return;
    }

    if (!connection.isActive) {
      await ctx.reply("❌ Tu cuenta está desvinculada. Usa /start para reconectar.");
      return;
    }

    ctx.crmUserId = connection.userId;
    await next();
  });

  // Message processing
  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text!.trim();

    if (text.startsWith("/")) return;

    if (!ctx.crmUserId) {
      await handleVerificationCode(ctx, text);
      return;
    }

    await ctx.reply("🤔 Procesando tu consulta...");

    try {
      const result = await generateText({
        model: getModel(),
        system: TELEGRAM_SYSTEM_PROMPT,
        stopWhen: [isLoopFinished(), stepCountIs(5)],
        messages: [{ role: "user", content: text }],
        tools: allTools,
      });

      const needsConfirmation =
        /¿confirmas|¿quieres que|¿deseas|¿procedo|¿continuamos|¿estás seguro/i.test(result.text);

      await ctx.reply(result.text, {
        reply_markup: needsConfirmation
          ? new InlineKeyboard()
              .text("✅ Sí, confirmar", "confirm_action")
              .text("❌ Cancelar", "cancel_action")
          : mainMenuKeyboard(),
      });
    } catch (error) {
      console.error("Telegram AI error:", error);
      await ctx.reply(
        "❌ Ocurrió un error al procesar tu consulta. Por favor, intenta de nuevo.",
        { reply_markup: mainMenuKeyboard() }
      );
    }
  });

  // Callbacks
  bot.callbackQuery("confirm_action", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    await ctx.reply(
      "He entendido que quieres confirmar. Por favor, responde *sí*, *confirmo* o *adelante* para que ejecute la acción.",
      { parse_mode: "Markdown" }
    );
  });

  bot.callbackQuery("cancel_action", async (ctx) => {
    await ctx.answerCallbackQuery("✅ Operación cancelada.");
    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    await ctx.reply("✅ Operación cancelada. ¿Necesitas algo más?", {
      reply_markup: mainMenuKeyboard(),
    });
  });

  bot.callbackQuery("menu_main", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    await ctx.reply("¿Qué deseas hacer?", { reply_markup: mainMenuKeyboard() });
  });

  bot.callbackQuery("help", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    await ctx.reply(
      "*Comandos disponibles:*\n\n" +
        "/start — Verificar estado de la cuenta\n" +
        "/ayuda — Mostrar ayuda\n" +
        "/cancelar — Cancelar operación actual\n" +
        "/menu — Mostrar menú principal",
      { parse_mode: "Markdown" }
    );
  });

  bot.callbackQuery("start_verification", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Por favor, envía el código de vinculación que aparece en tu dashboard.");
  });

  // Query buttons
  bot.callbackQuery(/^query_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const action = ctx.match![1];

    const promptMap: Record<string, string> = {
      clientes: "Lista todos los clientes activos",
      resumen: "Dame un resumen ejecutivo del negocio",
      recordatorios: "Lista los recordatorios pendientes",
      vencimientos: "¿Qué pólizas están por vencer en los próximos 30 días?",
      nuevo_prospecto: "Quiero registrar un nuevo prospecto",
    };

    const prompt = promptMap[action] || `Quiero información sobre ${action}`;
    await ctx.reply(`🤔 Procesando: "${prompt}"`);

    try {
      const result = await generateText({
        model: getModel(),
        system: TELEGRAM_SYSTEM_PROMPT,
        stopWhen: [isLoopFinished(), stepCountIs(5)],
        messages: [{ role: "user", content: prompt }],
        tools: allTools,
      });

      await ctx.reply(result.text, { reply_markup: mainMenuKeyboard() });
    } catch (error) {
      console.error("Telegram callback AI error:", error);
      await ctx.reply("❌ Error al procesar la solicitud. Intenta de nuevo.", {
        reply_markup: mainMenuKeyboard(),
      });
    }
  });
}

// ─── Verification handler ───────────────────

async function handleVerificationCode(ctx: AuthedContext, code: string) {
  const normalizedCode = code.trim().toUpperCase();

  const record = await prisma.telegramVerificationCode.findUnique({
    where: { code: normalizedCode },
    include: { user: true },
  });

  if (!record) {
    await ctx.reply(
      "❌ Código inválido. Verifica el código en tu dashboard e intenta de nuevo.\n\n" +
        "Si no tienes un código, ve a Configuración > Telegram en el CRM para generar uno."
    );
    return;
  }

  if (record.used) {
    await ctx.reply("❌ Este código ya fue usado. Genera uno nuevo en el dashboard.");
    return;
  }

  if (new Date() > record.expiresAt) {
    await ctx.reply(
      "❌ El código ha expirado. Genera uno nuevo en el dashboard (Configuración > Telegram)."
    );
    return;
  }

  await prisma.telegramVerificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  const telegramId = String(ctx.from!.id);
  const username = ctx.from?.username ?? null;

  await prisma.telegramConnection.upsert({
    where: { telegramId },
    create: {
      telegramId,
      chatId: String(ctx.chat!.id),
      username,
      userId: record.userId,
    },
    update: {
      chatId: String(ctx.chat!.id),
      username,
      userId: record.userId,
      isActive: true,
    },
  });

  await ctx.reply(
    `✅ *¡Cuenta vinculada exitosamente!*\n\n` +
      `Bienvenido, ${record.user.name}. Ya puedes consultar el CRM desde Telegram.\n\n` +
      `Prueba preguntándome algo como:\n` +
      `• "¿Cómo va la empresa?"\n` +
      `• "Lista los prospectos nuevos"\n` +
      `• "¿Qué pólizas vencen este mes?"`,
    { parse_mode: "Markdown", reply_markup: mainMenuKeyboard() }
  );
}

// ─── Keyboards ──────────────────────────────

function mainMenuKeyboard() {
  return new InlineKeyboard()
    .text("📋 Consultar Clientes", "query_clientes")
    .text("📊 Resumen del CRM", "query_resumen")
    .row()
    .text("⏰ Recordatorios", "query_recordatorios")
    .text("📈 Pólizas por Vencer", "query_vencimientos")
    .row()
    .text("➕ Nuevo Prospecto", "query_nuevo_prospecto")
    .text("❓ Ayuda", "help");
}

function verificationStartKeyboard() {
  return new InlineKeyboard().text("🔗 Ya tengo un código", "start_verification");
}

// ─── Exports ────────────────────────────────

export function getWebhookHandler() {
  const bot = getBot();
  if (!bot) {
    return async (req: Request) => new Response("Bot not configured", { status: 200 });
  }
  return webhookCallback(bot, "std/http");
}

export async function sendTelegramNotification(userId: string, text: string): Promise<boolean> {
  const bot = getBot();
  if (!bot) return false;

  try {
    const connection = await prisma.telegramConnection.findFirst({
      where: { userId, isActive: true },
    });
    if (!connection) return false;

    await bot.api.sendMessage(Number(connection.chatId), text, { parse_mode: "Markdown" });
    return true;
  } catch (error) {
    console.error("sendTelegramNotification error:", error);
    return false;
  }
}

export async function sendTelegramNotificationToChat(
  chatId: string | number,
  text: string
): Promise<boolean> {
  const bot = getBot();
  if (!bot) return false;

  try {
    await bot.api.sendMessage(Number(chatId), text, { parse_mode: "Markdown" });
    return true;
  } catch (error) {
    console.error("sendTelegramNotificationToChat error:", error);
    return false;
  }
}

export async function sendDailyDigest(): Promise<number> {
  const bot = getBot();
  if (!bot) return 0;

  const connections = await prisma.telegramConnection.findMany({
    where: { isActive: true },
    include: { user: true },
  });

  let sent = 0;
  for (const conn of connections) {
    try {
      const result = await generateText({
        model: getModel(),
        system:
          "Eres un asistente de CRM que genera un resumen ejecutivo matutino corto y útil. Responde en español, máximo 5 líneas. No uses markdown complejo.",
        messages: [
          {
            role: "user",
            content:
              "Genera un resumen de hoy que incluya: pólizas por vencer en 30 días, facturas vencidas, recordatorios pendientes del día, y métricas clave del dashboard.",
          },
        ],
        tools: digestTools,
      });

      const header = `☀️ *Buenos días, ${conn.user.name}*\n\n`;
      await bot.api.sendMessage(Number(conn.chatId), header + result.text, {
        parse_mode: "Markdown",
        reply_markup: mainMenuKeyboard(),
      });
      sent++;
    } catch (error) {
      console.error(`Error sending digest to user ${conn.userId}:`, error);
    }
  }

  return sent;
}
