import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { 
  SearchIcon, 
  FilterIcon, 
  MoreHorizontalIcon, 
  PlusIcon,
  MessageSquareIcon,
  FileTextIcon,
  TrashIcon,
  UserCheckIcon,
  BuildingIcon,
  UserIcon
} from "lucide-react"

import { SectionCard } from "@/components/admin/section-card"

const mockProspects = [
  {
    id: 1,
    name: "Transportes Andinos S.A.",
    type: "business",
    document: "NIT 900.123.456-7",
    email: "gerencia@transportesandinos.com",
    phone: "310 123 4567",
    services: ["Póliza Vehicular", "Asesoría Tránsito"],
    status: "En Proceso",
    createdAt: "2024-03-28",
  },
  {
    id: 2,
    name: "María Fernanda Lopez",
    type: "individual",
    document: "CC 1.053.456.789",
    email: "mafe.lopez@email.com",
    phone: "312 987 6543",
    services: ["SOAT", "Seguro de Vida"],
    status: "Nuevo",
    createdAt: "2024-03-29",
  },
  {
    id: 3,
    name: "Constructora Horizonte",
    type: "business",
    document: "NIT 800.987.654-3",
    email: "proyectos@horizonte.co",
    phone: "320 555 4433",
    services: ["ARL", "Póliza Todo Riesgo"],
    status: "Contactado",
    createdAt: "2024-03-27",
  },
]

const statusConfig: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Nuevo": "default",
  "En Proceso": "secondary",
  "Contactado": "outline",
  "Descartado": "destructive",
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prospectos</h1>
          <p className="text-muted-foreground mt-2">
            Gestión centralizada de clientes y prospectos capturados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger render={<Button />}>
              <PlusIcon data-icon="inline-start" />
              Nuevo Prospecto
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Añadir Prospecto</DialogTitle>
                <DialogDescription>
                  Ingresa manualmente la información del prospecto capturado fuera de la plataforma.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel htmlFor="prospect-name">Nombre / Razón Social</FieldLabel>
                  <Input id="prospect-name" placeholder="Ej. Juan Perez o Empresa S.A." />
                </Field>
                <Field>
                  <FieldLabel htmlFor="prospect-email">Correo Electrónico</FieldLabel>
                  <Input id="prospect-email" type="email" placeholder="correo@ejemplo.com" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="prospect-phone">Celular</FieldLabel>
                    <Input id="prospect-phone" placeholder="310 000 0000" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="prospect-type">Tipo</FieldLabel>
                    <Select>
                      <SelectTrigger id="prospect-type">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Persona</SelectItem>
                        <SelectItem value="business">Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter>
                <Button type="submit">Guardar Prospecto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FileTextIcon data-icon="inline-start" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Prospectos"
          value="1,284"
          trend="up"
          trendValue="+12%"
          footerTitle="Captura activa"
        />
        <SectionCard
          title="Por Contactar"
          value="43"
          trend="down"
          trendValue="-2"
          footerTitle="Pendientes hoy"
        />
        <SectionCard
          title="Última Captura"
          description="Hoy, 10:45 AM"
          footerTitle="Origen: Web Pública"
        />
        <SectionCard
          title="Eficiencia de Contacto"
          description="Alta Navegabilidad"
          footerTitle="Sincronizado"
        />
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Base de Datos Principal</CardTitle>
              <CardDescription>
                Lista de prospectos esperando ser contactados.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <InputGroup className="w-full sm:w-[250px]">
                <SearchIcon data-slot="icon" />
                <InputGroupInput placeholder="Buscar por nombre o correo..." />
              </InputGroup>
              <Select>
                <SelectTrigger className="w-[140px]">
                  <FilterIcon data-icon="inline-start" className="size-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="proceso">En Proceso</SelectItem>
                  <SelectItem value="contactado">Contactado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
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
              {mockProspects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {prospect.type === "business" ? <BuildingIcon className="size-4" /> : <UserIcon className="size-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{prospect.name}</span>
                        <span className="text-xs text-muted-foreground">{prospect.document}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{prospect.email}</span>
                      <span className="text-xs text-muted-foreground">{prospect.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[prospect.status]}>
                      {prospect.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prospect.services.slice(0, 2).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-[10px] px-1.5 leading-none">
                          {service}
                        </Badge>
                      ))}
                      {prospect.services.length > 2 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 leading-none">
                          +{prospect.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                        <MoreHorizontalIcon className="size-4" />
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
                          <DropdownMenuItem>
                            <UserCheckIcon data-icon="inline-start" className="size-4" />
                            Marcar Contactado
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <TrashIcon data-icon="inline-start" className="size-4 text-destructive" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {mockProspects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No hay prospectos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando <strong>1-3</strong> de <strong>1,284</strong> prospectos
            </p>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
