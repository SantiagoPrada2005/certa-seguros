import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { PoliciesClient } from "./_components/policies-client"

export const metadata: Metadata = {
  title: "Pólizas | Certa Seguros",
  description: "Administración directa de pólizas de seguros activos",
}

export default async function PoliciesPage() {
  // Obtener pólizas con relaciones
  const policies = await prisma.policy.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true, documentNumber: true } },
      service: { select: { id: true, name: true, price: true } }
    }
  })

  // Obtener catálogos para los selectores del formulario
  const [clients, services] = await Promise.all([
    prisma.client.findMany({
      select: { id: true, name: true, documentNumber: true },
      orderBy: { name: 'asc' }
    }),
    prisma.service.findMany({
      select: { id: true, name: true },
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  ])

  // Adaptar el tipo Decimal de Prisma a Number para el cliente (serialización de RSC)
  const serializedPolicies = policies.map(p => ({
    ...p,
    premiumAmount: Number(p.premiumAmount),
    commissionAmount: Number(p.commissionAmount),
    service: p.service ? {
      ...p.service,
      price: p.service.price ? Number(p.service.price) : null
    } : null
  }))

  return (
    <div className="flex flex-col flex-1 h-full w-full max-w-7xl mx-auto py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pólizas de Seguros
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Administra la cartera de pólizas activas, vencimientos, y registra nuevos productos para tus clientes en seguimiento de periodos de cobertura.
        </p>
      </div>

      <PoliciesClient 
        initialPolicies={serializedPolicies} 
        clients={clients} 
        services={services} 
      />
    </div>
  )
}
