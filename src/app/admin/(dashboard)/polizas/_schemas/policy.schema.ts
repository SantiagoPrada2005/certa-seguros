import { z } from "zod";
import { PolicyType, PolicyStatus } from "@/generated/prisma";

export const policySchema = z.object({
  id: z.string().optional(),
  policyNumber: z.string().min(3, "El número de póliza es requerido e inválido").max(50, "El número de póliza es demasiado largo"),
  type: z.nativeEnum(PolicyType, {
    errorMap: () => ({ message: "Debes seleccionar un tipo de póliza" }),
  }),
  premiumAmount: z.coerce.number().min(0, "La prima debe ser un valor positivo"),
  commissionAmount: z.coerce.number().min(0, "La comisión debe ser un valor positivo"),
  startDate: z.date({
    errorMap: () => ({ message: "La fecha de inicio es requerida" }),
  }),
  endDate: z.date({
    errorMap: () => ({ message: "La fecha de fin es requerida" }),
  }),
  status: z.nativeEnum(PolicyStatus).default("ACTIVE"),
  clientId: z.string().min(1, "Debes seleccionar un cliente"),
  serviceId: z.string().optional().nullable(),
}).refine((data) => data.startDate <= data.endDate, {
  message: "La fecha de finalización no puede ser antes de la fecha de inicio",
  path: ["endDate"],
});

export type PolicyFormValues = z.infer<typeof policySchema>;
