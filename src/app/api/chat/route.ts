import { openRouter } from "@lib/openrouter";
import { NextResponse } from "next/server";
import { tool } from "@openrouter/sdk";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const getClientsTool = tool({
  name: "get_clients",
  description: "Obtener una lista de clientes o prospectos, opcionalmente filtrada por estado.",
  inputSchema: z.object({
    status: z.enum(["NUEVO", "CONTACTADO", "EN_PROCESO", "ACTIVO", "INACTIVO", "DESCARTADO"]).optional().describe("Filtrar por estado del cliente"),
    limit: z.number().optional().default(10).describe("Límite de resultados a devolver (máximo 50)")
  }),
  execute: async ({ status, limit }) => {
    try {
      const clients = await prisma.client.findMany({
        where: status ? { status: status as any } : undefined,
        take: Math.min(limit, 50),
        select: { id: true, name: true, type: true, email: true, phone: true, status: true, documentNumber: true }
      });
      return { clients };
    } catch (e: any) {
      return { error: `Error fetching clients: ${e.message}` }
    }
  }
});

const getClientDetailsTool = tool({
  name: "get_client_details",
  description: "Obtener todos los detalles de un cliente específico por su ID.",
  inputSchema: z.object({
    id: z.string().describe("UUID del cliente")
  }),
  execute: async ({ id }) => {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        policies: true,
        services: { include: { service: true } }
      }
    });
    if (!client) return { error: "Cliente no encontrado" };
    return { client };
  }
});

const getServicesTool = tool({
  name: "get_services",
  description: "Obtener la lista de servicios ofrecidos.",
  inputSchema: z.object({
    activeOnly: z.boolean().optional().default(true).describe("Devolver solo los servicios activos")
  }),
  execute: async ({ activeOnly }) => {
    const services = await prisma.service.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      select: { id: true, name: true, validityType: true, price: true, description: true }
    });
    return { services };
  }
});

const getServiceDetailsTool = tool({
  name: "get_service_details",
  description: "Obtener detalles de un servicio específico por su ID.",
  inputSchema: z.object({
    id: z.string().describe("ID o UUID del servicio")
  }),
  execute: async ({ id }) => {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        subcategory: { include: { category: true } }
      }
    });
    if (!service) return { error: "Servicio no encontrado" };
    return { service };
  }
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API Key not configured" },
        { status: 500 }
      );
    }

    const result = openRouter.callModel({
      model: "google/gemini-2.5-flash",
      input: messages,
      tools: [getClientsTool, getClientDetailsTool, getServicesTool, getServiceDetailsTool],
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const delta of result.getTextStream()) {
            controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
