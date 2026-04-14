import { NextResponse } from "next/server";
import { tool, streamText } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

export const runtime = "nodejs";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
} as any);

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
} as any);

const getClientsTool = tool({

  description: "Obtener una lista de clientes o prospectos, opcionalmente filtrada por estado.",
  parameters: z.object({
    status: z.enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "ACTIVO", "INACTIVO", "DESCARTADO"]).optional().describe("Filtrar por estado del cliente"),
    limit: z.number().optional().default(10).describe("Límite de resultados a devolver (máximo 50)")
  }),
  execute: async ({ status, limit }: any) => {
    try {
      const clients = await prisma.client.findMany({
        where: status ? { status: status as any } : undefined,
        take: Math.min(limit, 50),
        select: { id: true, name: true, type: true, email: true, phone: true, status: true, documentNumber: true }
      } as any);
      return JSON.stringify({ clients } as any);
    } catch (e: any) {
      return JSON.stringify({ error: `Error fetching clients: ${e.message}` } as any);
    }
  }
} as any);

const getClientDetailsTool = tool({
  description: "Obtener todos los detalles de un cliente específico por su ID.",
  parameters: z.object({
    id: z.string().describe("UUID del cliente")
  }),
  execute: async ({ id }: any) => {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        policies: true,
        services: { include: { service: true } }
      }
    } as any);
    if (!client) return JSON.stringify({ error: "Cliente no encontrado" } as any);
    return JSON.stringify({ client } as any);
  }
} as any);

const getServicesTool = tool({
  description: "Obtener la lista de servicios ofrecidos.",
  parameters: z.object({
    activeOnly: z.boolean().optional().default(true).describe("Devolver solo los servicios activos")
  }),
  execute: async ({ activeOnly }: any) => {
    const services = await prisma.service.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      select: { id: true, name: true, validityType: true, price: true, description: true }
    } as any);
    return JSON.stringify({ services } as any);
  }
} as any);

const getServiceDetailsTool = tool({
  description: "Obtener detalles de un servicio específico por su ID.",
  parameters: z.object({
    id: z.string().describe("ID o UUID del servicio")
  }),
  execute: async ({ id }: any) => {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        subcategory: { include: { category: true } }
      }
    } as any);
    if (!service) return JSON.stringify({ error: "Servicio no encontrado" } as any);
    return JSON.stringify({ service } as any);
  }
} as any);

const tools = {
  get_clients: getClientsTool,
  get_client_details: getClientDetailsTool,
  get_services: getServicesTool,
  get_service_details: getServiceDetailsTool,
};

export async function POST(req: Request) {
  try {
    const { messages, provider } = await req.json();

    if (provider === "groq" && !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API Key not configured" },
        { status: 500 }
      );
    }
    if (provider !== "groq" && !process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API Key not configured" },
        { status: 500 }
      );
    }

    const model = provider === "groq" ? groq("llama-3.3-70b-versatile") : openrouter("google/gemini-2.5-flash");

    const result = streamText({
      model,
      messages,
      tools,
      // maxSteps property not supported in this version of AI SDK
    } as any);

    return (result as any).toDataStreamResponse ? (result as any).toDataStreamResponse() : (result as any).toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
