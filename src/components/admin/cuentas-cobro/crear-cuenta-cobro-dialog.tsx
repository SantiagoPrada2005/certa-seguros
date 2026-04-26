"use client";

import React, { useState } from 'react';
import { PlusIcon, Trash2Icon, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@lib/utils"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export interface CrearCuentaCobroDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
  defaultClientName?: string;
  defaultClientDocument?: string;
  defaultClientId?: string;
  defaultServiceId?: string;
  defaultAmount?: number;
  defaultDescription?: string;
}

export function CrearCuentaCobroDialog({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
  defaultClientName,
  defaultClientDocument,
  defaultClientId,
  defaultServiceId,
  defaultAmount,
  defaultDescription,
}: CrearCuentaCobroDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled && externalOnOpenChange ? externalOnOpenChange : setInternalOpen;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fechaVence, setFechaVence] = useState<Date | undefined>(undefined);
  const [items, setItems] = useState<Array<{ id: string, serviceId?: string, description: string, quantity: number, unitPrice: number }>>([
    { id: '1', serviceId: '', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [includeIVA, setIncludeIVA] = useState(false);
  const [taxRate, setTaxRate] = useState(0.19);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountDescription, setDiscountDescription] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientNit, setClientNit] = useState('');
  const [clientId, setClientId] = useState('');

  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbClients, setDbClients] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  React.useEffect(() => {
    if (open) {
      setIsLoadingData(true);
      import("@/app/admin/actions").then((actions) => {
        Promise.all([
          actions.getServicesForInvoicing(),
          actions.getClientsForPaymentRequests()
        ]).then(([servicesRes, clientsRes]) => {
           if (servicesRes.success && servicesRes.data) setDbServices(servicesRes.data);
           if (clientsRes.success && clientsRes.data) setDbClients(clientsRes.data);
           setIsLoadingData(false);
        });
      });
    }
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setFechaVence(undefined);
      setDiscountAmount(0);
      setDiscountDescription('');
      setIncludeIVA(false);
      setTaxRate(0.19);
      setClientName(defaultClientName || '');
      setClientNit(defaultClientDocument || '');
      setClientId(defaultClientId || '');
      setBankName('');
      setAccountType('');
      setAccountNumber('');

      const initialItems: Array<{ id: string, serviceId?: string, description: string, quantity: number, unitPrice: number }> = [];

      if (defaultAmount) {
        initialItems.push({
          id: '1',
          serviceId: defaultServiceId,
          description: defaultDescription || 'Honorarios profesionales',
          quantity: 1,
          unitPrice: defaultAmount,
        });
      }

      if (initialItems.length === 0) {
        initialItems.push({
          id: '1',
          serviceId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
        });
      }

      setItems(initialItems);
    }
  }, [open, defaultClientName, defaultClientDocument, defaultClientId, defaultServiceId, defaultAmount, defaultDescription]);

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'serviceId') {
          if (value === 'manual') {
            updatedItem.description = '';
            updatedItem.unitPrice = 0;
          } else {
            const service = dbServices.find(s => s.id === value);
            if (service) {
              updatedItem.description = service.name;
              updatedItem.unitPrice = Number(service.price) || 0;
            }
          }
        }

        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = includeIVA ? taxableAmount * taxRate : 0;
  const total = taxableAmount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Error: Cliente no identificado.", {
        description: "Se necesita asociar la cuenta de cobro a un cliente válido."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { createPaymentRequest } = await import("@/app/admin/actions");

      const number = `CC-${Math.floor(100000 + Math.random() * 900000)}`;

      const formData = {
        number,
        date: new Date().toISOString(),
        dueDate: fechaVence ? fechaVence.toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        clientId,
        subtotal,
        discountAmount,
        discountDescription: discountDescription || undefined,
        taxRate: includeIVA ? taxRate : 0,
        taxAmount: includeIVA ? taxAmount : 0,
        total,
        notes: "Cuenta de cobro generada automáticamente.",
        bankName: bankName || undefined,
        accountType: accountType || undefined,
        accountNumber: accountNumber || undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        }))
      };

      const result = await createPaymentRequest(formData);

      if (result.success) {
        toast.success(`Cuenta de cobro #${number} creada con éxito`, {
          description: `Se ha registrado el cobro por ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`,
        });
        setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
        setFechaVence(undefined);
        setDiscountAmount(0);
        setDiscountDescription('');
        setOpen(false);
      } else {
        toast.error("Error al crear la cuenta de cobro", { description: result.error });
      }
    } catch (error) {
      toast.error("Error inesperado", { description: "No se pudo completar la solicitud." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <Button render={<DialogTrigger />}>
          <PlusIcon data-icon="inline-start" />
          Crear Cuenta de Cobro
        </Button>
      )}
      <DialogContent
        className="max-w-[calc(100vw-1rem)] sm:max-w-4xl flex flex-col p-0 overflow-hidden top-[2vh] translate-y-0 h-[96vh] sm:h-[90vh] max-h-[900px] gap-0 border-none shadow-2xl rounded-2xl"
      >
        <DialogHeader className="px-6 py-6 border-b shrink-0 bg-background z-10">
          <DialogTitle className="text-xl">Nueva Cuenta de Cobro</DialogTitle>
          <DialogDescription>
            Completa los detalles para generar una cuenta de cobro al cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-muted/5 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
            <div className="max-w-3xl mx-auto space-y-12 pb-10">
              {/* Sección 1: Cliente */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">1. Identificación del Cliente</h3>
                </div>
                <FieldGroup className="grid gap-6 sm:grid-cols-2">
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="cliente-select">Seleccionar Cliente</FieldLabel>
                    <Select
                      value={clientId}
                      onValueChange={(val: string | null) => {
                        const finalVal = val ?? "";
                        setClientId(finalVal);
                        if (finalVal) {
                          const client = dbClients.find(c => c.id === finalVal);
                          if (client) {
                            setClientName(client.name);
                            setClientNit(client.documentNumber || "");
                          }
                        } else {
                          setClientName("");
                          setClientNit("");
                        }
                      }}
                      disabled={!!defaultClientId}
                    >
                      <SelectTrigger className="bg-background shadow-xs h-11" id="cliente-select">
                        <SelectValue placeholder={isLoadingData ? "Cargando clientes..." : "Seleccionar o buscar cliente..."}>
                          {clientId && (
                            <span>{clientName || dbClients.find(c => c.id === clientId)?.name}</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {dbClients.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.documentNumber ? `(${c.documentNumber})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field className="hidden sm:block">
                    <FieldLabel htmlFor="cliente-nombre">Razón Social</FieldLabel>
                    <Input id="cliente-nombre" disabled value={clientName} placeholder="Seleccionar arriba..." className="bg-muted/50 shadow-xs h-11 border-muted" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cliente-nit">NIT / Documento</FieldLabel>
                    <Input id="cliente-nit" disabled value={clientNit} placeholder="Seleccionar arriba..." className="bg-muted/50 shadow-xs h-11 border-muted" />
                  </Field>
                  <Field>
                    <FieldLabel>Fecha de Vencimiento</FieldLabel>
                    <Popover>
                      <Button
                        render={<PopoverTrigger />}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11 bg-background shadow-xs",
                          !fechaVence && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon data-icon="inline-start" />
                        {fechaVence ? format(fechaVence, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={fechaVence} onSelect={setFechaVence} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </Field>
                </FieldGroup>
              </div>

              <Separator />

              {/* Sección 2: Servicios */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-primary rounded-full" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">2. Detalle de Servicios</h3>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="bg-background shadow-xs hover:bg-primary/5 hover:text-primary transition-all">
                    <PlusIcon data-icon="inline-start" className="size-4" />
                    Añadir Ítem
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="group relative rounded-2xl border bg-background p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                      {items.length > 1 && (
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                          <Button type="button" variant="destructive" size="icon" className="size-7 rounded-full shadow-lg" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      )}
                      <div className="grid gap-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Field>
                            <FieldLabel>Tipo de Servicio</FieldLabel>
                            <Select
                              value={item.serviceId ?? ""}
                              onValueChange={(val: string | null) => updateItem(item.id, 'serviceId', val ?? "")}
                              disabled={isLoadingData}
                            >
                              <SelectTrigger className={cn("bg-muted/30 border-muted h-11", !item.serviceId && "border-destructive/50")}>
                                <SelectValue placeholder={isLoadingData ? "Cargando..." : "Seleccionar del catálogo..."}>
                                  {item.serviceId && (() => {
                                    if (item.serviceId === 'manual') return <span>+ Servicio Personalizado / Otro</span>;
                                    const svc = dbServices.find(s => s.id === item.serviceId);
                                    if (svc) return <span>{svc.name}</span>;
                                    return null;
                                  })()}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {dbServices.map(s => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name} {s.price ? ` - $${Number(s.price).toLocaleString('es-CO')}` : ''}
                                  </SelectItem>
                                ))}
                                <SelectItem value="manual" className="font-medium text-amber-600 dark:text-amber-500">
                                  + Servicio Personalizado / Otro
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`desc-${item.id}`}>Descripción</FieldLabel>
                            <Input
                              id={`desc-${item.id}`}
                              required
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="bg-muted/30 border-muted h-11"
                            />
                          </Field>
                        </div>

                        <div className="grid gap-6 items-end sm:grid-cols-12">
                          <Field className="sm:col-span-3">
                            <FieldLabel htmlFor={`qty-${item.id}`}>Cantidad</FieldLabel>
                            <Input
                              id={`qty-${item.id}`}
                              type="number" min="1" required
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="bg-muted/20 border-transparent focus:bg-background h-11"
                            />
                          </Field>
                          <Field className="sm:col-span-5">
                            <FieldLabel htmlFor={`price-${item.id}`}>Vlr Unitario ($)</FieldLabel>
                            <Input
                              id={`price-${item.id}`}
                              type="number" min="0" required
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                              className="bg-muted/20 border-transparent focus:bg-background h-11"
                            />
                          </Field>
                          <div className="sm:col-span-4 flex flex-col items-end pb-2">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Línea</span>
                            <span className="text-xl font-bold text-foreground">
                              ${(item.quantity * item.unitPrice).toLocaleString('es-CO')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Sección 3: Descuentos, IVA y Totales */}
              <div className="grid gap-12 lg:grid-cols-5 items-start">
                <div className="lg:col-span-2 space-y-8">
                  {/* IVA Toggle */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-blue-500 rounded-full" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">3. Configuración de IVA</h3>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-background">
                      <Label htmlFor="include-iva" className="font-medium cursor-pointer">Incluir IVA</Label>
                      <input
                        id="include-iva"
                        type="checkbox"
                        checked={includeIVA}
                        onChange={(e) => setIncludeIVA(e.target.checked)}
                        className="toggle toggle-primary size-5"
                      />
                      {includeIVA && (
                        <div className="flex items-center gap-2 ml-auto">
                          <Label htmlFor="tax-rate" className="text-sm text-muted-foreground">Tasa:</Label>
                          <Select value={String(taxRate)} onValueChange={(v) => setTaxRate(parseFloat(v ?? "0.19"))}>
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.19">19%</SelectItem>
                              <SelectItem value="0.05">5%</SelectItem>
                              <SelectItem value="0">0%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descuentos */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-amber-500 rounded-full" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">4. Aplicar Descuento</h3>
                    </div>
                    <FieldGroup className="grid gap-4">
                      <Field>
                        <FieldLabel htmlFor="discount-desc">Motivo del Descuento</FieldLabel>
                        <Input id="discount-desc" placeholder="Ej. Cortesía comercial" value={discountDescription} onChange={(e) => setDiscountDescription(e.target.value)} className="bg-background shadow-xs" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="discount-amt">Valor del Descuento ($)</FieldLabel>
                        <Input id="discount-amt" type="number" min="0" placeholder="0" value={discountAmount} onChange={(e) => setDiscountAmount(parseInt(e.target.value) || 0)} className="bg-background shadow-xs h-11" />
                      </Field>
                    </FieldGroup>
                  </div>

                  {/* Datos Bancarios */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-green-500 rounded-full" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">5. Datos Bancarios</h3>
                    </div>
                    <FieldGroup className="grid gap-4">
                      <Field>
                        <FieldLabel htmlFor="bank-name">Banco</FieldLabel>
                        <Input id="bank-name" placeholder="Ej. Bancolombia" value={bankName} onChange={(e) => setBankName(e.target.value)} className="bg-background shadow-xs" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="account-type">Tipo de Cuenta</FieldLabel>
                        <Select value={accountType} onValueChange={(val) => setAccountType(val ?? "")}>
                          <SelectTrigger className="bg-background shadow-xs h-11" id="account-type">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ahorros">Ahorros</SelectItem>
                            <SelectItem value="Corriente">Corriente</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="account-number">Número de Cuenta</FieldLabel>
                        <Input id="account-number" placeholder="Ej. 123-456789-00" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="bg-background shadow-xs" />
                      </Field>
                    </FieldGroup>
                  </div>

                  {/* Observaciones */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-primary rounded-full" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">6. Observaciones</h3>
                    </div>
                    <Textarea
                      placeholder="Incluye información adicional..."
                      className="h-32 bg-background shadow-xs resize-none p-4"
                    />
                  </div>
                </div>

                <div className="lg:col-span-3 bg-primary/[0.03] p-8 rounded-3xl border border-primary/10 space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Subtotal Neto</span>
                    <span className="text-base font-semibold text-foreground">${subtotal.toLocaleString('es-CO')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-amber-600 font-medium">
                      <span className="text-sm italic">Descuento ({discountDescription || 'General'})</span>
                      <span className="text-base">-${discountAmount.toLocaleString('es-CO')}</span>
                    </div>
                  )}

                  {includeIVA && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-sm font-medium text-muted-foreground">IVA ({(taxRate * 100).toFixed(0)}%)</span>
                      <span className="text-base font-semibold text-foreground">${taxAmount.toLocaleString('es-CO')}</span>
                    </div>
                  )}

                  <Separator className="bg-primary/10" />

                  <div className="flex justify-between items-end pt-2">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-muted-foreground uppercase tracking-tight">Total a Pagar</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Moneda: COP</span>
                    </div>
                    <span className="text-4xl font-black text-primary tracking-tighter">
                      ${total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="m-0 border-t bg-background shrink-0 z-10 flex flex-row items-center justify-between gap-4 p-6 sm:px-10 rounded-b-2xl">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting} className="hover:bg-muted text-muted-foreground font-medium h-11 px-6">
              Descartar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-10 h-11 text-base font-bold shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? "Creando..." : "Crear Cuenta de Cobro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
