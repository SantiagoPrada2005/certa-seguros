"use client";

import * as React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontalIcon, SendIcon, CheckCircleIcon, FileEditIcon, Loader2Icon, FilterIcon,
} from "lucide-react";
import { fetchInvoices, type InvoiceRecord } from "@/lib/api-client";
import { updateInvoiceStatus } from "@/app/admin/actions";
import { PdfDownloadButton } from "@/components/admin/facturas/pdf-download-button";
import { toast } from "sonner";

const formatCurrency = (value: number) => {
  try {
    return new Intl.NumberFormat("es-CO", { 
      style: "currency", 
      currency: "COP", 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  } catch (e) {
    return `$ ${value.toLocaleString()}`;
  }
};

// Use a stable date format that doesn't depend on system locale during SSR
const formatDate = (dateInput: string | Date) => {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  // Fallback to a simple ISO-like format if format fails or to ensure consistency
  try {
    return format(date, "d 'de' MMM, yyyy", { locale: es });
  } catch (e) {
    return date.toLocaleDateString("es-CO");
  }
};

type Status = "DRAFT" | "PENDING" | "PAID" | "OVERDUE";

const statusStyles: Record<Status, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; colorClass: string }> = {
  PAID:    { variant: "default",     label: "Pagada",    colorClass: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  PENDING: { variant: "secondary",   label: "Pendiente", colorClass: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  OVERDUE: { variant: "destructive", label: "Vencida",   colorClass: "bg-destructive/15 text-destructive border-destructive/20" },
  DRAFT:   { variant: "outline",     label: "Borrador",  colorClass: "text-muted-foreground" },
};

interface FacturasTableProps {
  initialInvoices: InvoiceRecord[];
}

export function FacturasTable({ initialInvoices }: FacturasTableProps) {
  const [invoices, setInvoices] = React.useState<InvoiceRecord[]>(initialInvoices);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state when Server Component re-renders (e.g. after revalidatePath)
  React.useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isMounted) return;
    setLoading(true);
    fetchInvoices({ status: statusFilter !== "all" ? statusFilter : undefined })
      .then(setInvoices)
      .catch(() => toast.error("Error al cargar las facturas"))
      .finally(() => setLoading(false));
  }, [statusFilter, isMounted]);

  const handleMarkPaid = async (id: string) => {
    setActionLoading(id);
    const result = await updateInvoiceStatus(id, "PAID");
    if (result.success) {
      setInvoices((prev) =>
        prev.map((inv) => inv.id === id ? { ...inv, status: "PAID" } : inv)
      );
      toast.success("Factura marcada como pagada");
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  // Convert InvoiceRecord to legacy Invoice format for PdfDownloadButton
  const toLegacyInvoice = (inv: InvoiceRecord) => ({
    id: inv.id,
    number: inv.number,
    clientId: inv.clientId,
    clientName: inv.client.name,
    date: formatDate(inv.date),
    dueDate: formatDate(inv.dueDate),
    subtotal: inv.subtotal,
    discountAmount: inv.discountAmount,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    total: inv.total,
    status: inv.status.toLowerCase() as any,
    items: (inv.items ?? []).map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice),
      total: typeof item.total === 'number' ? item.total : Number(item.total),
    })),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Registro de Facturas</CardTitle>
            <CardDescription>Listado histórico y reciente de todas tus facturas.</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <FilterIcon data-icon="inline-start" className="size-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="PAID">Pagada</SelectItem>
              <SelectItem value="OVERDUE">Vencida</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && (
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
              {invoices.map((invoice) => {
                const style = statusStyles[invoice.status as Status] ?? statusStyles.DRAFT;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{invoice.client.name}</span>
                        {invoice.client.email && (
                          <span className="text-xs text-muted-foreground">{invoice.client.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {isMounted ? formatDate(invoice.date) : "---"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {isMounted ? formatDate(invoice.dueDate) : "---"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={style.variant} className={style.colorClass}>{style.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm tabular-nums">
                      {isMounted ? formatCurrency(invoice.total) : "---"}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === invoice.id}>
                            {actionLoading === invoice.id
                              ? <Loader2Icon className="h-4 w-4 animate-spin" />
                              : <MoreHorizontalIcon className="h-4 w-4" />}
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Acciones de Factura</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 flex items-center justify-start w-full cursor-pointer">
                              <PdfDownloadButton
                                invoice={toLegacyInvoice(invoice)}
                                variant="ghost"
                                className="w-full text-left font-normal h-8 flex items-center justify-start py-0 px-2!"
                              />
                            </div>
                            <DropdownMenuItem>
                              <SendIcon data-icon="inline-start" className="h-4 w-4 mr-2" />
                              Enviar por correo
                            </DropdownMenuItem>
                            {invoice.status !== "PAID" && (
                              <DropdownMenuItem onClick={() => handleMarkPaid(invoice.id)}>
                                <CheckCircleIcon data-icon="inline-start" className="size-4 mr-2 text-emerald-500" />
                                Marcar como Pagada
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No hay facturas que coincidan con el filtro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
