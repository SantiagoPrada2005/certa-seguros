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
  MoreHorizontalIcon, CheckCircleIcon, XCircleIcon, Loader2Icon, FilterIcon,
} from "lucide-react";
import { fetchPaymentRequests, type PaymentRequestRecord } from "@/lib/api-client";
import { updatePaymentRequestStatus } from "@/app/admin/actions";
import { PdfDownloadButton } from "@/components/admin/cuentas-cobro/pdf-download-button";
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

const formatDate = (dateInput: string | Date) => {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  try {
    return format(date, "d 'de' MMM, yyyy", { locale: es });
  } catch (e) {
    return date.toLocaleDateString("es-CO");
  }
};

type Status = "DRAFT" | "PENDING" | "PAID" | "CANCELLED";

const statusStyles: Record<Status, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; colorClass: string }> = {
  PAID:      { variant: "default",     label: "Pagada",    colorClass: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  PENDING:   { variant: "secondary",   label: "Pendiente", colorClass: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  CANCELLED: { variant: "destructive", label: "Cancelada", colorClass: "bg-destructive/15 text-destructive border-destructive/20" },
  DRAFT:     { variant: "outline",     label: "Borrador",  colorClass: "text-muted-foreground" },
};

interface CuentasCobroTableProps {
  initialPaymentRequests: PaymentRequestRecord[];
}

export function CuentasCobroTable({ initialPaymentRequests }: CuentasCobroTableProps) {
  const [paymentRequests, setPaymentRequests] = React.useState<PaymentRequestRecord[]>(initialPaymentRequests);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    setPaymentRequests(initialPaymentRequests);
  }, [initialPaymentRequests]);

  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isMounted) return;
    setLoading(true);
    fetchPaymentRequests({ status: statusFilter !== "all" ? statusFilter : undefined })
      .then(setPaymentRequests)
      .catch(() => toast.error("Error al cargar las cuentas de cobro"))
      .finally(() => setLoading(false));
  }, [statusFilter, isMounted]);

  const handleMarkPaid = async (id: string) => {
    setActionLoading(id);
    const result = await updatePaymentRequestStatus(id, "PAID");
    if (result.success) {
      setPaymentRequests((prev) =>
        prev.map((pr) => pr.id === id ? { ...pr, status: "PAID" } : pr)
      );
      toast.success("Cuenta de cobro marcada como pagada");
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    const result = await updatePaymentRequestStatus(id, "CANCELLED");
    if (result.success) {
      setPaymentRequests((prev) =>
        prev.map((pr) => pr.id === id ? { ...pr, status: "CANCELLED" } : pr)
      );
      toast.success("Cuenta de cobro cancelada");
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  const toLegacyPR = (pr: PaymentRequestRecord) => ({
    id: pr.id,
    number: pr.number,
    clientId: pr.clientId,
    clientName: pr.client.name,
    date: formatDate(pr.date),
    dueDate: formatDate(pr.dueDate),
    subtotal: pr.subtotal,
    discountAmount: pr.discountAmount,
    taxRate: pr.taxRate,
    taxAmount: pr.taxAmount,
    total: pr.total,
    status: pr.status.toLowerCase() as any,
    bankName: pr.bankName || undefined,
    accountType: pr.accountType || undefined,
    accountNumber: pr.accountNumber || undefined,
    items: (pr.items ?? []).map(item => ({
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
            <CardTitle>Registro de Cuentas de Cobro</CardTitle>
            <CardDescription>Listado histórico y reciente de todas tus cuentas de cobro.</CardDescription>
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
              <SelectItem value="CANCELLED">Cancelada</SelectItem>
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
              {paymentRequests.map((pr) => {
                const style = statusStyles[pr.status as Status] ?? statusStyles.DRAFT;
                return (
                  <TableRow key={pr.id}>
                    <TableCell className="font-medium">{pr.number}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{pr.client.name}</span>
                        {pr.client.email && (
                          <span className="text-xs text-muted-foreground">{pr.client.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {isMounted ? formatDate(pr.date) : "---"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {isMounted ? formatDate(pr.dueDate) : "---"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={style.variant} className={style.colorClass}>{style.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm tabular-nums">
                      {isMounted ? formatCurrency(pr.total) : "---"}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === pr.id}>
                            {actionLoading === pr.id
                              ? <Loader2Icon className="h-4 w-4 animate-spin" />
                              : <MoreHorizontalIcon className="h-4 w-4" />}
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 flex items-center justify-start w-full cursor-pointer">
                              <PdfDownloadButton
                                paymentRequest={toLegacyPR(pr)}
                                variant="ghost"
                                className="w-full text-left font-normal h-8 flex items-center justify-start py-0 px-2!"
                              />
                            </div>
                            {pr.status !== "PAID" && pr.status !== "CANCELLED" && (
                              <>
                                <DropdownMenuItem onClick={() => handleMarkPaid(pr.id)}>
                                  <CheckCircleIcon data-icon="inline-start" className="size-4 mr-2 text-emerald-500" />
                                  Marcar como Pagada
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCancel(pr.id)}>
                                  <XCircleIcon data-icon="inline-start" className="size-4 mr-2 text-destructive" />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paymentRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No hay cuentas de cobro que coincidan con el filtro.
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
