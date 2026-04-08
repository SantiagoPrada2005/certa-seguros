"use client";

import * as React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  SearchIcon, FilterIcon, MoreHorizontalIcon,
  MessageSquareIcon, FileTextIcon, TrashIcon, UserCheckIcon,
  BuildingIcon, UserIcon, Loader2Icon,
} from "lucide-react";
import { fetchClients, type ClientRecord } from "@/lib/api-client";
import { updateClientStatus, deleteClient } from "@/app/admin/actions";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const statusConfig: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NUEVO: "default",
  CONTACTADO: "outline",
  EN_PROCESO: "secondary",
  ACTIVO: "default",
  INACTIVO: "outline",
  DESCARTADO: "destructive",
};

const statusLabel: Record<string, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  EN_PROCESO: "En Proceso",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  DESCARTADO: "Descartado",
};

interface ProspectosTableProps {
  initialClients: ClientRecord[];
}

export function ProspectosTable({ initialClients }: ProspectosTableProps) {
  const [clients, setClients] = React.useState<ClientRecord[]>(initialClients);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Client-side fetch when filters change
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchClients({
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search || undefined,
        });
        setClients(data);
        setPage(1);
      } catch {
        toast.error("Error al cargar los prospectos");
      } finally {
        setLoading(false);
      }
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
  const paginated = clients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkContacted = async (id: string) => {
    setActionLoading(id);
    const result = await updateClientStatus(id, "CONTACTADO");
    if (result.success) {
      setClients((prev) => prev.map((c) => c.id === id ? { ...c, status: "CONTACTADO" } : c));
      toast.success("Prospecto marcado como contactado");
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a "${name}"? Esta acción no se puede deshacer.`)) return;
    setActionLoading(id);
    const result = await deleteClient(id);
    if (result.success) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Prospecto eliminado correctamente");
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Base de Datos Principal</CardTitle>
            <CardDescription>
              Lista de prospectos y clientes en la plataforma.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="w-full sm:w-[250px]">
              <SearchIcon data-slot="icon" />
              <InputGroupInput
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-[140px]">
                <FilterIcon data-icon="inline-start" className="size-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="NUEVO">Nuevo</SelectItem>
                <SelectItem value="CONTACTADO">Contactado</SelectItem>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="DESCARTADO">Descartado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Prospecto</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {client.type === "BUSINESS"
                            ? <BuildingIcon className="size-4" />
                            : <UserIcon className="size-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{client.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {client.documentType
                            ? `${client.documentType} ${client.documentNumber ?? ""}`
                            : (client.type === "BUSINESS" ? "Empresa" : "Persona")}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{client.email ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{client.phone ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[client.status] ?? "outline"}>
                      {statusLabel[client.status] ?? client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.services.slice(0, 2).map((cs, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 leading-none">
                          {cs.service.name}
                        </Badge>
                      ))}
                      {client.services.length > 2 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 leading-none">
                          +{client.services.length - 2}
                        </Badge>
                      )}
                      {client.services.length === 0 && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={actionLoading === client.id} />}>
                        {actionLoading === client.id
                          ? <Loader2Icon className="size-4 animate-spin" />
                          : <MoreHorizontalIcon className="size-4" />}
                        <span className="sr-only">Menú de acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <MessageSquareIcon data-icon="inline-start" className="size-4" />
                            WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleMarkContacted(client.id)}>
                            <UserCheckIcon data-icon="inline-start" className="size-4" />
                            Marcar Contactado
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onSelect={() => handleDelete(client.id, client.name)}
                          >
                            <TrashIcon data-icon="inline-start" className="size-4 text-destructive" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No hay prospectos que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {!loading && clients.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando <strong>{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, clients.length)}</strong> de <strong>{clients.length}</strong>
            </p>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={page === p}
                      onClick={(e) => { e.preventDefault(); setPage(p); }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
