"use client";

import * as React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { SearchIcon, Loader2Icon } from "lucide-react";
import { fetchServices, type ServiceRecord } from "@/lib/api-client";
import { toast } from "sonner";
import { EditarServicioDialog } from "./editar-servicio-dialog";

const validityLabel: Record<string, string> = {
  UNICA_VEZ: "Única vez",
  ANUAL: "Anual",
  MENSUAL: "Mensual",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
};

interface ServiciosTableProps {
  initialServices: ServiceRecord[];
  categories: {
    id: string;
    name: string;
    subcategories: { id: string; name: string }[];
  }[];
}

export function ServiciosTable({ initialServices, categories }: ServiciosTableProps) {
  const [services, setServices] = React.useState<ServiceRecord[]>(initialServices);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [editingService, setEditingService] = React.useState<ServiceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Sync state when Server Component re-renders (e.g. after revalidatePath)
  React.useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  // Client-side filter by name (no need for API call for search here)
  const filtered = React.useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.subcategory?.name.toLowerCase().includes(q) ||
        s.subcategory?.category.name.toLowerCase().includes(q)
    );
  }, [services, search]);

  const refreshServices = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchServices();
      setServices(data);
    } catch {
      toast.error("Error al actualizar los servicios");
    } finally {
      setLoading(false);
    }
  }, []);

  const openEditDialog = React.useCallback((service: ServiceRecord) => {
    setEditingService(service);
    setDialogOpen(true);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Listado de Servicios</CardTitle>
            <CardDescription>
              Visualiza y administra todos los servicios categorizados disponibles.
            </CardDescription>
          </div>
          <InputGroup className="w-full sm:w-[250px]">
            <SearchIcon data-slot="icon" />
            <InputGroupInput
              placeholder="Buscar servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
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
                <TableHead>Servicio</TableHead>
                <TableHead className="w-[140px]">Categoría</TableHead>
                <TableHead className="w-[140px]">Subcategoría</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((service) => (
                <TableRow
                  key={service.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openEditDialog(service)}
                >
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{service.name}</span>
                      {service.description && (
                        <span
                          className="text-muted-foreground line-clamp-1 text-xs max-w-[300px]"
                          title={service.description}
                        >
                          {service.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.subcategory?.category.name
                      ? <Badge variant="secondary">{service.subcategory.category.name}</Badge>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    {service.subcategory?.name
                      ? <Badge variant="outline">{service.subcategory.name}</Badge>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {service.validityType ? validityLabel[service.validityType] ?? service.validityType : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "default" : "outline"}>
                      {service.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {service.price != null
                      ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(service.price))
                      : service.priceDescription ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No hay servicios que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <EditarServicioDialog
        service={editingService}
        categories={categories}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={refreshServices}
      />
    </Card>
  );
}
