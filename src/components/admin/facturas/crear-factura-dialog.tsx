"use client";

import React, { useState } from 'react';
import { PlusIcon, Trash2Icon, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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

const mockServicios = [
  { id: '1', nombre: "Seguro Todo Riesgo", valor: 1200000 },
  { id: '2', nombre: "Asesoría Legal", valor: 200000 },
  { id: '3', nombre: "Póliza de Salud", valor: 800000 },
  { id: '4', nombre: "Actualización SST", valor: 500000 },
];

export function CrearFacturaDialog() {
  const [open, setOpen] = useState(false);
  const [fechaVence, setFechaVence] = useState<Date | undefined>(undefined);
  const [items, setItems] = useState([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0.19); // Default 19% IVA
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountDescription, setDiscountDescription] = useState('');

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };

        // If selecting a service from the dropdown
        if (field === 'serviceId') {
          const service = mockServicios.find(s => s.id === value);
          if (service) {
            updatedItem.description = service.nombre;
            updatedItem.unitPrice = service.valor;
          }
        }

        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  // Tax calculation: Discount is applied BEFORE tax
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * taxRate;
  const total = taxableAmount + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate invoice creation
    const invoiceId = Math.floor(1000 + Math.random() * 9000);

    toast.success(`Factura #${invoiceId} emitida con éxito`, {
      description: `Se ha registrado el cobro por ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`,
    });

    // Reset state and close
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
    setFechaVence(undefined);
    setDiscountAmount(0);
    setDiscountDescription('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button>
          <PlusIcon data-icon="inline-start" />
          Crear Factura
        </Button>
      } />
      <DialogContent
        className="max-w-[calc(100vw-1rem)] sm:max-w-4xl flex flex-col p-0 overflow-hidden top-[2vh] translate-y-0 h-[96vh] sm:h-[90vh] max-h-[900px] gap-0 border-none shadow-2xl rounded-2xl"
      >
        <DialogHeader className="px-6 py-6 border-b shrink-0 bg-background z-10">
          <DialogTitle className="text-xl">Nueva Factura</DialogTitle>
          <DialogDescription>
            Completa los detalles de facturación para el cliente y los servicios prestados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-muted/5 overflow-hidden">
          {/* Contenedor con Scroll Real */}
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
                    <FieldLabel htmlFor="cliente-nombre">Nombre o Razón Social</FieldLabel>
                    <Input id="cliente-nombre" required placeholder="Ej. ACME Corporation S.A.S." className="bg-background shadow-xs h-11" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cliente-nit">NIT / Documento</FieldLabel>
                    <Input id="cliente-nit" required placeholder="900.000.000-0" className="bg-background shadow-xs h-11" />
                  </Field>
                  <Field>
                    <FieldLabel>Fecha de Vencimiento</FieldLabel>
                    <Popover>
                      <PopoverTrigger render={<Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 bg-background shadow-xs", !fechaVence && "text-muted-foreground")} />}>
                        <CalendarIcon data-icon="inline-start" />
                        {fechaVence ? format(fechaVence, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fechaVence}
                          onSelect={setFechaVence}
                          initialFocus
                        />
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
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="size-7 rounded-full shadow-lg"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      )}

                      <div className="grid gap-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Field>
                            <FieldLabel>Tipo de Servicio</FieldLabel>
                            <Select onValueChange={(val) => updateItem(item.id, 'serviceId', val)}>
                              <SelectTrigger className="bg-muted/30 border-muted h-11">
                                <SelectValue placeholder="Seleccionar del catálogo..." />
                              </SelectTrigger>
                              <SelectContent>
                                {mockServicios.map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`desc-${item.id}`}>Descripción en Factura</FieldLabel>
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
                              type="number"
                              min="1"
                              required
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="bg-muted/20 border-transparent focus:bg-background h-11"
                            />
                          </Field>
                          <Field className="sm:col-span-5">
                            <FieldLabel htmlFor={`price-${item.id}`}>Vlr Unitario ($)</FieldLabel>
                            <Input
                              id={`price-${item.id}`}
                              type="number"
                              min="0"
                              required
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

              {/* Sección 3: Descuentos y Totales */}
              <div className="grid gap-12 lg:grid-cols-5 items-start">
                <div className="lg:col-span-2 space-y-8">
                  {/* Descuentos */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-amber-500 rounded-full" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">3. Aplicar Descuento</h3>
                    </div>
                    <FieldGroup className="grid gap-4">
                      <Field>
                        <FieldLabel htmlFor="discount-desc">Motivo del Descuento</FieldLabel>
                        <Input
                          id="discount-desc"
                          placeholder="Ej. Cortesía comercial"
                          value={discountDescription}
                          onChange={(e) => setDiscountDescription(e.target.value)}
                          className="bg-background shadow-xs"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="discount-amt">Valor del Descuento ($)</FieldLabel>
                        <Input
                          id="discount-amt"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(parseInt(e.target.value) || 0)}
                          className="bg-background shadow-xs h-11"
                        />
                      </Field>
                    </FieldGroup>
                  </div>

                  {/* Observaciones */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-primary rounded-full" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">4. Observaciones</h3>
                    </div>
                    <Textarea
                      id="notas"
                      placeholder="Incluye información adicional como cuentas bancarias o condiciones especiales..."
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

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-sm font-medium text-muted-foreground">Impuesto (IVA {(taxRate * 100).toFixed(0)}%)</span>
                    <span className="text-base font-semibold text-foreground">${taxAmount.toLocaleString('es-CO')}</span>
                  </div>

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
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-muted text-muted-foreground font-medium h-11 px-6">
              Descartar
            </Button>
            <Button type="submit" className="px-10 h-11 text-base font-bold shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
              Emitir Factura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
