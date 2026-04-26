import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { getClientsTool } from "@/lib/tools/get-clients";
import { getClientDetailsTool } from "@/lib/tools/get-client-details";
import { getServicesTool } from "@/lib/tools/get-services";
import { getServiceDetailsTool } from "@/lib/tools/get-service-details";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "google/gemini-2.5-flash",
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
