"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { policySchema, PolicyFormValues } from "../_schemas/policy.schema";
import { PolicyStatus, PolicyType } from "@/generated/prisma";
import { unstable_rethrow } from "next/navigation";

export async function createPolicy(data: PolicyFormValues) {
  try {
    const validatedData = policySchema.parse(data);

    const policy = await prisma.policy.create({
      data: {
        policyNumber: validatedData.policyNumber,
        type: validatedData.type,
        premiumAmount: validatedData.premiumAmount,
        commissionAmount: validatedData.commissionAmount,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        status: validatedData.status,
        clientId: validatedData.clientId,
        serviceId: validatedData.serviceId || null,
      },
    });

    // Registrar actividad en el sistema
    await prisma.activityLog.create({
      data: {
        action: `Nueva póliza creada: ${policy.policyNumber}`,
        type: "SUCCESS",
        metadata: { policyId: policy.id, policyType: policy.type },
        clientId: policy.clientId,
      },
    });

    revalidatePath("/admin/polizas");
    revalidatePath(`/admin/clientes`);
    
    return { success: true, data: policy };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error creating policy:", error);
    return { success: false, error: "Error al crear la póliza" };
  }
}

export async function updatePolicy(id: string, data: Partial<PolicyFormValues>) {
  try {
    const policy = await prisma.policy.update({
      where: { id },
      data: {
        ...(data.policyNumber && { policyNumber: data.policyNumber }),
        ...(data.type && { type: data.type }),
        status: data.status,
        ...(data.premiumAmount !== undefined && { premiumAmount: data.premiumAmount }),
        ...(data.commissionAmount !== undefined && { commissionAmount: data.commissionAmount }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.clientId && { clientId: data.clientId }),
        serviceId: data.serviceId || null
      },
    });
    
    await prisma.activityLog.create({
      data: {
        action: `Póliza ${policy.policyNumber} actualizada`,
        type: "INFO",
        metadata: { policyId: policy.id },
        clientId: policy.clientId,
      },
    });

    revalidatePath("/admin/polizas");
    return { success: true, data: policy };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error updating policy:", error);
    return { success: false, error: "Error al actualizar la póliza" };
  }
}

export async function deletePolicy(id: string) {
  try {
    const policy = await prisma.policy.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: `Póliza ${policy.policyNumber} eliminada`,
        type: "DANGER",
        metadata: { policyId: policy.id },
        clientId: policy.clientId,
      },
    });

    revalidatePath("/admin/polizas");
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error deleting policy:", error);
    return { success: false, error: "Error al eliminar la póliza" };
  }
}

export async function updatePolicyStatus(id: string, status: PolicyStatus) {
  try {
    const policy = await prisma.policy.update({
      where: { id },
      data: { status },
    });

    let activityType: "INFO" | "SUCCESS" | "WARNING" | "DANGER" = "INFO";
    if (status === "CANCELLED" || status === "EXPIRED") activityType = "WARNING";
    if (status === "ACTIVE") activityType = "SUCCESS";

    await prisma.activityLog.create({
      data: {
        action: `Estado de póliza ${policy.policyNumber} cambiado a ${status}`,
        type: activityType,
        metadata: { policyId: policy.id, newStatus: status },
        clientId: policy.clientId,
      },
    });

    revalidatePath("/admin/polizas");
    return { success: true, data: policy };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error updating policy status:", error);
    return { success: false, error: "Error al cambiar el estado de la póliza" };
  }
}
