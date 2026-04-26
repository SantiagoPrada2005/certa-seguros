import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getClientsTool } from "@/lib/tools/get-clients";
import { getClientDetailsTool } from "@/lib/tools/get-client-details";
import { getServicesTool } from "@/lib/tools/get-services";
import { getServiceDetailsTool } from "@/lib/tools/get-service-details";

export const runtime = "nodejs";

function getModel() {
  const modelName = process.env.CHAT_MODEL || "google/gemini-2.5-flash";

  if (modelName.startsWith("openrouter/")) {
    const openrouter = createOpenAICompatible({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || "",
    });
    return openrouter(modelName.replace("openrouter/", ""));
  }

  return modelName;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: getModel(),
    messages: await convertToModelMessages(messages),
    tools: {
      get_clients: getClientsTool,
      get_client_details: getClientDetailsTool,
      get_services: getServicesTool,
      get_service_details: getServiceDetailsTool,
    },
  });

  return result.toUIMessageStreamResponse();
}
