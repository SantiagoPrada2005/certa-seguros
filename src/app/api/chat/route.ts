import { streamText, convertToModelMessages, isLoopFinished, stepCountIs, type UIMessage } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

// Read tools — Clientes y Prospectos
import { getClientsTool } from "@/lib/tools/get-clients";
import { getClientDetailsTool } from "@/lib/tools/get-client-details";
import { getProspectsTool } from "@/lib/tools/get-prospects";
import { getProspectDetailsTool } from "@/lib/tools/get-prospect-details";
import { getClientTagsTool } from "@/lib/tools/get-client-tags";

// Read tools — Pólizas
import { getPoliciesTool } from "@/lib/tools/get-policies";
import { getPolicyDetailsTool } from "@/lib/tools/get-policy-details";
import { getExpiringPoliciesTool } from "@/lib/tools/get-expiring-policies";

// Read tools — Facturas
import { getInvoicesTool } from "@/lib/tools/get-invoices";
import { getInvoiceDetailsTool } from "@/lib/tools/get-invoice-details";

// Read tools — Seguimiento
import { getRemindersTool } from "@/lib/tools/get-reminders";
import { getRecentActivityTool } from "@/lib/tools/get-recent-activity";

// Read tools — Servicios
import { getServicesTool } from "@/lib/tools/get-services";
import { getServiceDetailsTool } from "@/lib/tools/get-service-details";

// Read tools — Métricas
import { getGoalsTool } from "@/lib/tools/get-goals";
import { getDashboardSummaryTool } from "@/lib/tools/get-dashboard-summary";

// Write tools
import { createReminderTool } from "@/lib/tools/create-reminder";
import { createProspectTool } from "@/lib/tools/create-prospect";
import { updateProspectStatusTool } from "@/lib/tools/update-prospect-status";
import { updateClientStatusTool } from "@/lib/tools/update-client-status";
import { updatePolicyStatusTool } from "@/lib/tools/update-policy-status";
import { convertProspectToClientTool } from "@/lib/tools/convert-prospect-to-client";
import { logActivityTool } from "@/lib/tools/log-activity";

export const runtime = "nodejs";

function getModel() {
  const modelName = process.env.CHAT_MODEL || "google/gemini-2.5-flash";

  if (modelName.startsWith("openrouter/")) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not configured but CHAT_MODEL requests an OpenRouter model."
      );
    }
    const openrouter = createOpenAICompatible({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });
    return openrouter(modelName.replace("openrouter/", ""));
  }

  return gateway(modelName);
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: getModel(),
      system: SYSTEM_PROMPT,
      stopWhen: [isLoopFinished(), stepCountIs(5)],
      messages: await convertToModelMessages(messages),
      tools: {
        // Read — Clientes y Prospectos
        get_clients: getClientsTool,
        get_client_details: getClientDetailsTool,
        get_prospects: getProspectsTool,
        get_prospect_details: getProspectDetailsTool,
        get_client_tags: getClientTagsTool,

        // Read — Pólizas
        get_policies: getPoliciesTool,
        get_policy_details: getPolicyDetailsTool,
        get_expiring_policies: getExpiringPoliciesTool,

        // Read — Facturas
        get_invoices: getInvoicesTool,
        get_invoice_details: getInvoiceDetailsTool,

        // Read — Seguimiento
        get_reminders: getRemindersTool,
        get_recent_activity: getRecentActivityTool,

        // Read — Servicios
        get_services: getServicesTool,
        get_service_details: getServiceDetailsTool,

        // Read — Métricas
        get_goals: getGoalsTool,
        get_dashboard_summary: getDashboardSummaryTool,

        // Write
        create_reminder: createReminderTool,
        create_prospect: createProspectTool,
        update_prospect_status: updateProspectStatusTool,
        update_client_status: updateClientStatusTool,
        update_policy_status: updatePolicyStatusTool,
        convert_prospect_to_client: convertProspectToClientTool,
        log_activity: logActivityTool,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
