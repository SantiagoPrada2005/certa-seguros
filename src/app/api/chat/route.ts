import { streamText, convertToModelMessages, isLoopFinished, stepCountIs, type UIMessage } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getClientsTool } from "@/lib/tools/get-clients";
import { getClientDetailsTool } from "@/lib/tools/get-client-details";
import { getServicesTool } from "@/lib/tools/get-services";
import { getServiceDetailsTool } from "@/lib/tools/get-service-details";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

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
        get_clients: getClientsTool,
        get_client_details: getClientDetailsTool,
        get_services: getServicesTool,
        get_service_details: getServiceDetailsTool,
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
