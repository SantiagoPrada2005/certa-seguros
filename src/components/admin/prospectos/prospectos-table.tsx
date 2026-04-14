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
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal
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
  MessageSquareIcon, TrashIcon, UserCheckIcon,
  BuildingIcon, UserIcon, Loader2Icon, PencilIcon,
  UserPlusIcon, EyeIcon, TargetIcon,
} from "lucide-react";
import { fetchProspects, type ProspectRecord } from "@/lib/api-client";
import { updateProspectStatus, deleteProspect, convertProspectToClient } from "@/app/admin/(dashboard)/prospectos/_actions/prospect-actions";
import { EditarProspectoDialog } from "@/components/admin/prospectos/editar-prospecto-dialog";
import { ConvertirClienteDialog } from "@/components/admin/prospectos/convertir-cliente-dialog";
import { Prospect360Dialog } from "@/components/admin/prospectos/prospect-360-dialog";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const statusConfig: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NUEVO: "default",
  CONTACTADO: "outline",
  EN_PROCESO: "secondary",
  DESCARTADO: "destructive",
  CONVERTIDO: "default",
};

const statusLabel: Record<string, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  EN_PROCESO: "En Proceso",
  DESCARTADO: "Descartado",
  CONVERTIDO: "Convertido",
};

interface ProspectosTableProps {
  initialProspects: ProspectRecord[];
  externalStatusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export function ProspectosTable({ initialProspects, externalStatusFilter, onStatusFilterChange }: ProspectosTableProps) {
  const [prospects, setProspects] = React.useState<ProspectRecord[]>(initialProspects);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState(externalStatusFilter ?? "all");
  const [sourceFilter, setSourceFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [editingProspect, setEditingProspect] = React.useState<ProspectRecord | null>(null);
  const [convertingProspect, setConvertingProspect] = React.useState<ProspectRecord | null>(null);
  const [viewingProspect, setViewingProspect] = React.useState<ProspectRecord | null>(null);

  // Sync with external filter from KPI cards
  React.useEffect(() => {
    if (externalStatusFilter && externalStatusFilter !== "all") {
      setStatusFilter(externalStatusFilter)
    }
  }, [externalStatusFilter])

  // Sync state when Server Component re-renders (e.g. after revalidatePath)
  React.useEffect(() => {
    setProspects(initialProspects);
  }, [initialProspects]);

  // Client-side fetch when filters change
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchProspects({
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search || undefined,
        });
        // Client-side filter for source
        let filtered = data;
        if (sourceFilter !== "all") {
          filtered = data.filter(p => p.source === sourceFilter);
        }
        setProspects(filtered);
        setPage(1);
      } catch {
        toast.error("Error al cargar los prospectos");
      } finally {
        setLoading(false);
      }
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [search, statusFilter, sourceFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(prospects.length / PAGE_SIZE));
  const paginated = prospects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = async (id: string, newStatus: string) => {
    console.log("update prospect status", id, newStatus);
    setActionLoading(id);
    const result = await updateProspectStatus(id, newStatus as any);
    if (result.success) {
      setProspects((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus as ProspectRecord["status"] } : p));
      toast.success(`Estado actualizado a ${statusLabel[newStatus]}`);
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string, name: string) => {
    console.log("delete prospect", id);
    if (!confirm(`¿Eliminar a "${name}"? Esta acción no se puede deshacer.`)) return;
    setActionLoading(id);
    const result = await deleteProspect(id);
    if (result.success) {
      setProspects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prospecto eliminado correctamente");
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  const handleConvert = async (data: { prospectId: string; birthDate?: string | null; city?: string | null; notes?: string | null }) => {
    setActionLoading(data.prospectId);
    const result = await convertProspectToClient(data);
    if (result.success) {
      setProspects((prev) => prev.map((p) => p.id === data.prospectId ? { ...p, status: "CONVERTIDO" as const } : p));
      toast.success("Prospecto convertido a cliente exitosamente");
      setConvertingProspect(null);
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
            <CardTitle>Base de Datos de Prospectos</CardTitle>
            <CardDescription>
              Lista de prospectos potenciales en la plataforma.
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
            <Select value={statusFilter} onValueChange={(v) => {
              setStatusFilter(v ?? "all")
              onStatusFilterChange?.(v ?? "all")
            }}>
              <SelectTrigger className="w-[140px]">
                <FilterIcon data-icon="inline-start" className="size-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="NUEVO">Nuevo</SelectItem>
                <SelectItem value="CONTACTADO">Contactado</SelectItem>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="DESCARTADO">Descartado</SelectItem>
                <SelectItem value="CONVERTIDO">Convertido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v ?? "all")}>
              <SelectTrigger className="w-[160px]">
                <TargetIcon data-icon="inline-start" className="size-4" />
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="WEB_PUBLICA">Web Pública</SelectItem>
                <SelectItem value="REFERIDOS">Referidos</SelectItem>
                <SelectItem value="REDES_SOCIALES">Redes Sociales</SelectItem>
                <SelectItem value="DIRECTOS">Directos</SelectItem>
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
                <TableHead>Fuente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {prospect.type === "BUSINESS"
                            ? <BuildingIcon className="size-4" />
                            : <UserIcon className="size-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <button
                          onClick={() => setViewingProspect(prospect)}
                          className="font-medium text-sm text-left hover:text-primary transition-colors cursor-pointer"
                        >
                          {prospect.name}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {prospect.documentType
                            ? `${prospect.documentType} ${prospect.documentNumber ?? ""}`
                            : (prospect.type === "BUSINESS" ? "Empresa" : "Persona")}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{prospect.email ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{prospect.phone ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {prospect.source ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {{
                          WEB_PUBLICA: "Web",
                          REFERIDOS: "Referidos",
                          REDES_SOCIALES: "Redes",
                          DIRECTOS: "Directos",
                        }[prospect.source] || prospect.source}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[prospect.status] ?? "outline"}>
                      {statusLabel[prospect.status] ?? prospect.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prospect.services.slice(0, 2).map((ps, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 leading-none">
                          {ps.service.name}
                        </Badge>
                      ))}
                      {prospect.services.length > 2 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 leading-none">
                          +{prospect.services.length - 2}
                        </Badge>
                      )}
                      {prospect.services.length === 0 && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={actionLoading === prospect.id} />}>
                        {actionLoading === prospect.id
                          ? <Loader2Icon className="size-4 animate-spin" />
                          : <MoreHorizontalIcon className="size-4" />}
                        <span className="sr-only">Menú de acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewingProspect(prospect)}>
                            <EyeIcon data-icon="inline-start" className="size-4" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingProspect(prospect)}>
                            <PencilIcon data-icon="inline-start" className="size-4" />
                            Editar Información
                          </DropdownMenuItem>
                          {prospect.phone && (
                            <DropdownMenuItem onClick={() => {
                              const phone = prospect.phone!.replace(/\D/g, '')
                              const message = encodeURIComponent(`Hola ${prospect.name}, te contactamos de Certa Seguros`)
                              window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
                            }}>
                              <MessageSquareIcon data-icon="inline-start" className="size-4" />
                              WhatsApp
                            </DropdownMenuItem>
                          )}

                          {prospect.status !== "DESCARTADO" && prospect.status !== "CONVERTIDO" && (
                            <DropdownMenuItem onClick={() => setConvertingProspect(prospect)}>
                              <UserPlusIcon data-icon="inline-start" className="size-4" />
                              Convertir a Cliente
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <UserCheckIcon data-icon="inline-start" className="size-4" />
                              Cambiar estado
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                {Object.entries(statusLabel).map(([val, label]) => (
                                  <DropdownMenuItem
                                    key={val}
                                    onClick={() => handleStatusChange(prospect.id, val)}
                                    disabled={prospect.status === val}
                                  >
                                    {label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => handleDelete(prospect.id, prospect.name)}
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No hay prospectos que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {!loading && prospects.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando <strong>{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, prospects.length)}</strong> de <strong>{prospects.length}</strong>
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

      <EditarProspectoDialog
        prospect={editingProspect}
        onClose={() => setEditingProspect(null)}
        onSuccess={(updated) => {
          setProspects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
          setEditingProspect(null);
        }}
      />

      <ConvertirClienteDialog
        prospect={convertingProspect}
        onClose={() => setConvertingProspect(null)}
        onSuccess={handleConvert}
      />

      <Prospect360Dialog
        prospect={viewingProspect}
        isOpen={!!viewingProspect}
        onOpenChange={(open) => {
          if (!open) setViewingProspect(null)
        }}
        onConverted={() => {
          setViewingProspect(null)
          // Refresh the list
          fetchProspects({
            status: statusFilter !== "all" ? statusFilter : undefined,
            search: search || undefined,
          }).then(setProspects)
        }}
      />
    </Card>
  );
}
