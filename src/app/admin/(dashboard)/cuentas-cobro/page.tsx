import { SectionCard } from "@/components/admin/section-card";
import { CrearCuentaCobroDialog } from "@/components/admin/cuentas-cobro/crear-cuenta-cobro-dialog";
import { CuentasCobroTable } from "@/components/admin/cuentas-cobro/cuentas-cobro-table";
import prisma from "@/lib/prisma";

export default async function CuentasCobroPage() {
  const [total, pendientes, pagadas, canceladas] = await Promise.all([
    prisma.paymentRequest.count(),
    prisma.paymentRequest.count({ where: { status: "PENDING" } }),
    prisma.paymentRequest.count({ where: { status: "PAID" } }),
    prisma.paymentRequest.count({ where: { status: "CANCELLED" } }),
  ]);

  const [revenueResult] = await prisma.$queryRaw<[{ total: number }]>`
    SELECT COALESCE(SUM(total), 0) as total FROM payment_requests WHERE status = 'PAID'
  `;
  const [pendingResult] = await prisma.$queryRaw<[{ total: number }]>`
    SELECT COALESCE(SUM(total), 0) as total FROM payment_requests WHERE status IN ('PENDING', 'DRAFT')
  `;

  const prsRaw = await prisma.paymentRequest.findMany({
    orderBy: { date: "desc" },
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  const initialPaymentRequests = prsRaw.map(pr => ({
    ...pr,
    subtotal: pr.subtotal.toNumber(),
    discountAmount: pr.discountAmount.toNumber(),
    taxRate: pr.taxRate.toNumber(),
    taxAmount: pr.taxAmount.toNumber(),
    total: pr.total.toNumber(),
    items: pr.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      total: item.total.toNumber()
    }))
  }));

  const formatCOP = (n: number | bigint) => {
    const num = typeof n === "bigint" ? Number(n) : n;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
    return `$${num}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuentas de Cobro</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona tus cuentas de cobro y el estado de los pagos pendientes.
          </p>
        </div>
        <CrearCuentaCobroDialog />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Cobrado"
          value={formatCOP(revenueResult?.total ?? 0)}
          trend="up"
          trendValue="Cuentas pagadas"
          footerTitle="Ingresos confirmados"
        />
        <SectionCard
          title="Por Cobrar"
          value={formatCOP(pendingResult?.total ?? 0)}
          trend="down"
          trendValue={`${pendientes} pendientes`}
          footerTitle="PENDING + DRAFT"
        />
        <SectionCard
          title="Cuentas Pagadas"
          value={pagadas.toLocaleString("es-CO")}
          trend="up"
          trendValue="Estado: PAID"
          footerTitle="Pagadas exitosamente"
        />
        <SectionCard
          title="Cuentas Canceladas"
          value={canceladas.toLocaleString("es-CO")}
          trend={canceladas > 0 ? "down" : "up"}
          trendValue={canceladas > 0 ? "Requieren atención" : "Sin cancelaciones"}
          footerTitle="Estado: CANCELLED"
        />
      </div>

      {/* Cuentas de Cobro Table — Client Component */}
      <CuentasCobroTable initialPaymentRequests={initialPaymentRequests as any} />
    </div>
  );
}
