import { SectionCard } from "@/components/admin/section-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontalIcon, SendIcon, CheckCircleIcon, FileEditIcon } from "lucide-react"

import { CrearFacturaDialog } from "@/components/admin/facturas/crear-factura-dialog"
import { PdfDownloadButton } from "@/components/admin/facturas/pdf-download-button"
import { Invoice, InvoiceStatus, BillingStats } from "@/types/billing"

const mockStats: BillingStats = {
  totalBilled: 15450000,
  pendingAmount: 3500000,
  paidAmount: 11950000,
  overdueAmount: 2975000,
  percentageChange: 12.5,
};

const mockInvoices: Invoice[] = [
  {
    id: "inv_1",
    number: "FAC-001",
    clientId: "c_1",
    clientName: "Empresa ABC S.A.S.",
    date: "2026-03-25",
    dueDate: "2026-04-25",
    subtotal: 1000000,
    discountAmount: 0,
    taxRate: 0.19,
    taxAmount: 190000,
    total: 1190000,
    status: "paid",
    items: [{ id: "i_1", description: "Consultoría de Riesgos", quantity: 1, unitPrice: 1000000, total: 1000000 }]
  },
  {
    id: "inv_2",
    number: "FAC-002",
    clientId: "c_2",
    clientName: "Consultores y Cía",
    date: "2026-03-28",
    dueDate: "2026-04-28",
    subtotal: 500000,
    discountAmount: 0,
    taxRate: 0.19,
    taxAmount: 95000,
    total: 595000,
    status: "pending",
    items: [{ id: "i_2", description: "Renovación Póliza de Salud", quantity: 1, unitPrice: 500000, total: 500000 }]
  },
  {
    id: "inv_3",
    number: "FAC-003",
    clientId: "c_3",
    clientName: "Logística del Norte",
    date: "2026-02-15",
    dueDate: "2026-03-15",
    subtotal: 2500000,
    discountAmount: 0,
    taxRate: 0.19,
    taxAmount: 475000,
    total: 2975000,
    status: "overdue",
    items: [{ id: "i_3", description: "Seguro Flota Vehicular", quantity: 1, unitPrice: 2500000, total: 2500000 }]
  },
  {
    id: "inv_4",
    number: "FAC-004",
    clientId: "c_4",
    clientName: "Tecnología Innovadora Ltda",
    date: "2026-03-29",
    dueDate: "2026-04-29",
    subtotal: 1200000,
    discountAmount: 0,
    taxRate: 0.19,
    taxAmount: 228000,
    total: 1428000,
    status: "draft",
    items: [{ id: "i_4", description: "Diagnóstico Sistema SST", quantity: 1, unitPrice: 1200000, total: 1200000 }]
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusBadge = (status: InvoiceStatus) => {
  const styles: Record<InvoiceStatus, { variant: 'default' | 'destructive' | 'outline' | 'secondary', label: string, colorClass: string }> = {
    paid: { variant: 'default', label: 'Pagada', colorClass: 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    pending: { variant: 'secondary', label: 'Pendiente', colorClass: 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    overdue: { variant: 'destructive', label: 'Vencida', colorClass: '' },
    draft: { variant: 'outline', label: 'Borrador', colorClass: 'text-muted-foreground' }
  };
  
  const b = styles[status];
  return <Badge variant={b.variant} className={b.colorClass}>{b.label}</Badge>;
};

export function FacturasCards() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <SectionCard
        title="Total Facturado"
        value={formatCurrency(mockStats.totalBilled)}
        trend="up"
        trendValue={`+${mockStats.percentageChange}%`}
        footerTitle="Crecimiento mensual"
        footerDescription="Este mes actual"
      />
      <SectionCard
        title="Monto Pagado"
        value={formatCurrency(mockStats.paidAmount)}
        trend="up"
        trendValue="Seguro"
        footerTitle="Cashflow positivo"
        footerDescription="Dinero ya recibido"
      />
      <SectionCard
        title="Cobro Pendiente"
        value={formatCurrency(mockStats.pendingAmount)}
        trend="down"
        trendValue="Atención"
        footerTitle="Por recibir en los plazos"
        footerDescription="Próximos a vencer"
      />
      <SectionCard
        title="Facturas Vencidas"
        value={formatCurrency(mockStats.overdueAmount)}
        trend="down"
        trendValue="Riesgo"
        footerTitle="Atención inmediata requerida"
        footerDescription="Realice gestión de cobro"
      />
    </div>
  )
}

export default function FacturasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación Electrónica</h1>
          <p className="mt-2 text-muted-foreground">
            Crea, administra registros y genera facturas en PDF para tus clientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CrearFacturaDialog />
        </div>
      </div>

      <FacturasCards />

      <Card>
        <CardHeader>
          <CardTitle>Registro de Facturas</CardTitle>
          <CardDescription>
            Listado histórico y reciente de todas tus facturas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[80px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{invoice.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {invoice.date}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {invoice.dueDate}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm tabular-nums">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Acciones de Factura</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <div className="px-2 py-1.5 flex items-center justify-start w-full cursor-pointer">
                            <PdfDownloadButton invoice={invoice} variant="ghost" className="w-full text-left font-normal h-8 flex items-center justify-start py-0 px-2!" />
                          </div>
                          <DropdownMenuItem>
                            <SendIcon data-icon="inline-start" className="h-4 w-4 mr-2" />
                            Enviar por correo
                          </DropdownMenuItem>
                          {invoice.status !== 'paid' && (
                            <DropdownMenuItem>
                              <CheckCircleIcon data-icon="inline-start" className="h-4 w-4 mr-2 text-emerald-500" />
                              Marcar como pagada
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem>
                              <FileEditIcon data-icon="inline-start" className="h-4 w-4 mr-2" />
                              Editar borrador
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {mockInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No hay facturas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
