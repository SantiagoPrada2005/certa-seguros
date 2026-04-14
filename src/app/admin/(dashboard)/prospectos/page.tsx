import prisma from "@/lib/prisma"
import ProspectosClient from "./prospectos-client"

export default async function ProspectosPage() {
  // — KPI stats: fetched server-side
  const [total, porContactar, enProceso, descartados] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.count({ where: { status: "NUEVO" } }),
    prisma.prospect.count({ where: { status: "EN_PROCESO" } }),
    prisma.prospect.count({ where: { status: "DESCARTADO" } }),
  ])

  // — Initial data for the table
  const prospectsRaw = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      services: {
        include: { service: true },
      },
    },
  })

  const initialProspects = prospectsRaw.map((prospect) => ({
    ...prospect,
    services: prospect.services.map((ps) => ({
      ...ps,
      service: ps.service
        ? {
            ...ps.service,
            price: ps.service.price ? ps.service.price.toNumber() : null,
          }
        : null,
    })),
  }))

  return (
    <ProspectosClient
      initialProspects={initialProspects as any}
      kpiData={{ total, porContactar, enProceso, descartados }}
    />
  )
}
