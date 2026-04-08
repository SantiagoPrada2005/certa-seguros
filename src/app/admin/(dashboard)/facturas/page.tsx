import { SectionCard } from "@/components/admin/section-card";
import { CrearFacturaDialog } from "@/components/admin/facturas/crear-factura-dialog";
import { FacturasTable } from "@/components/admin/facturas/facturas-table";
import prisma from "@/lib/prisma";

export default async function FacturasPage() {
  // KPI stats server-side
  const [total, pendientes, pagadas, vencidas] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
  ]);

  // Revenue totals
  const [revenueResult] = await prisma.$queryRaw<[{ total: number }]>`
    SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'PAID'
  `;
  const [pendingResult] = await prisma.$queryRaw<[{ total: number }]>`
    SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status IN ('PENDING', 'OVERDUE')
  `;

  const invoicesRaw = await prisma.invoice.findMany({
    orderBy: { date: "desc" },
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  const initialInvoices = invoicesRaw.map(i => ({
    ...i,
    subtotal: i.subtotal.toNumber(),
    discountAmount: i.discountAmount.toNumber(),
    taxRate: i.taxRate.toNumber(),
    taxAmount: i.taxAmount.toNumber(),
    total: i.total.toNumber(),
    items: i.items.map(item => ({
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
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona tu facturación electrónica y el estado de cobros.
          </p>
        </div>
        <CrearFacturaDialog />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Facturado"
          value={formatCOP(revenueResult?.total ?? 0)}
          trend="up"
          trendValue="Facturas pagadas"
          footerTitle="Ingresos confirmados"
        />
        <SectionCard
          title="Por Cobrar"
          value={formatCOP(pendingResult?.total ?? 0)}
          trend="down"
          trendValue={`${pendientes} pendientes`}
          footerTitle="PENDING + OVERDUE"
        />
        <SectionCard
          title="Facturas Pagadas"
          value={pagadas.toLocaleString("es-CO")}
          trend="up"
          trendValue="Estado: PAID"
          footerTitle="Pagadas exitosamente"
        />
        <SectionCard
          title="Facturas Vencidas"
          value={vencidas.toLocaleString("es-CO")}
          trend={vencidas > 0 ? "down" : "up"}
          trendValue={vencidas > 0 ? "Requieren atención" : "Sin vencidas"}
          footerTitle="Estado: OVERDUE"
        />
      </div>

      {/* Facturas Table — Client Component */}
      <FacturasTable initialInvoices={initialInvoices as any} />
    </div>
  );
}
