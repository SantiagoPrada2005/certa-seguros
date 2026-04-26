import { tool } from "ai";
import { z, type ZodTypeAny, type ZodObject } from "zod";

export function createWriteTool<
  TSchema extends Record<string, ZodTypeAny>,
  TResult extends Record<string, unknown>,
>(config: {
  description: string;
  inputSchema: ZodObject<TSchema>;
  preview: (params: z.infer<ZodObject<TSchema>>) => string;
  execute: (params: z.infer<ZodObject<TSchema>>) => Promise<TResult>;
}) {
  const { description, inputSchema, preview, execute } = config;

  const enrichedSchema = z.object({
    ...inputSchema.shape,
    confirmed: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "SIEMPRE llama primero con confirmed=false para obtener vista previa. " +
          "Solo llama con confirmed=true DESPUÉS de que el usuario haya confirmado explícitamente.",
      ),
  });

  return tool({
    description,
    inputSchema: enrichedSchema as any,
    execute: async (rawParams: any) => {
      try {
        const { confirmed, ...params } = rawParams as {
          confirmed?: boolean;
          [key: string]: unknown;
        };

        if (!confirmed) {
          return {
            preview: preview(params as any),
            requiresConfirmation: true,
            message:
              "Muestra esta vista previa al usuario y pregúntale si desea continuar. " +
              "Si confirma, llama a esta herramienta con los mismos datos pero confirmed: true.",
          } as any;
        }

        const result = await execute(params as any);
        return { success: true, result } as any;
      } catch (e: any) {
        if (e?.code === "P2002") {
          return {
            error: "Error: Ya existe un registro con esos datos únicos.",
          } as any;
        }
        if (e?.code === "P2025") {
          return {
            error: "Error: El registro solicitado no fue encontrado.",
          } as any;
        }
        return {
          error: `Error al ejecutar la operación: ${e.message}`,
        } as any;
      }
    },
  });
}
