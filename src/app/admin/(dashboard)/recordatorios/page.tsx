"use client"

import * as React from "react"
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
  SelectItem,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  CheckCircle2Icon,
  LayoutGridIcon,
  ListIcon,
  CalendarDaysIcon,
  HistoryIcon,
  MessageSquareIcon,
  EditIcon,
  TrashIcon,
  ChevronRightIcon
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "lib/utils"

const mockReminders = [
  {
    id: 1,
    client: "Transportes Andinos S.A.",
    type: "Renovación Póliza Vehicular",
    dueDate: new Date(2026, 9, 15),
    priority: "Crítica",
    status: "Pendiente",
    description: "Vencimiento anual de pólizas (flota 5 vehículos). Contactar a Gerencia para renovación.",
  },
  {
    id: 2,
    client: "Constructora Horizonte",
    type: "Seguimiento Presencial ARL",
    dueDate: new Date(2026, 10, 20),
    priority: "Alta",
    status: "En Proceso",
    description: "Visita periódica ARL requerida. Confirmar fecha con líder SST.",
  },
  {
    id: 3,
    client: "María Fernanda Lopez",
    type: "Renovación SOAT",
    dueDate: new Date(2026, 8, 25),
    priority: "Inmediata",
    status: "Vencido",
    description: "Renovación atrasada. Urgente contactar al cliente.",
  },
]

const priorityConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
  "Inmediata": { variant: "destructive", icon: AlertTriangleIcon },
  "Crítica": { variant: "destructive", icon: AlertTriangleIcon },
  "Alta": { variant: "default", icon: ClockIcon },
  "Media": { variant: "secondary", icon: ClockIcon },
  "Baja": { variant: "outline", icon: ClockIcon },
}

const statusConfig: Record<string, string> = {
  "Pendiente": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200",
  "En Proceso": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200",
  "Completado": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200",
  "Vencido": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200",
}

export default function RemindersDashboardPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recordatorios y Alertas</h1>
          <p className="text-muted-foreground mt-2">
            Motor preventivo para fidelización. Renueva a tiempo y no pierdas comisiones.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger render={<Button />}>
              <PlusIcon data-icon="inline-start" />
              Programar Recordatorio
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nuevo Recordatorio</DialogTitle>
                <DialogDescription>
                  Configura una alerta para un cliente o prospecto.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel>Cliente / Prospecto</FieldLabel>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Transportes Andinos S.A.</SelectItem>
                      <SelectItem value="2">Constructora Horizonte</SelectItem>
                      <SelectItem value="3">María Fernanda Lopez</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Tipo de Alerta</FieldLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soat">Renovación SOAT</SelectItem>
                        <SelectItem value="poliza">Renovación Póliza</SelectItem>
                        <SelectItem value="arl">Seguimiento ARL</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Prioridad</FieldLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critica">Crítica</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Fecha Programada</FieldLabel>
                  <Popover>
                    <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal" />}>
                      <CalendarIcon className="mr-2 size-4" />
                      {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field>
                  <FieldLabel>Notas / Descripción</FieldLabel>
                  <Input placeholder="Detalles de la tarea..." />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button type="submit">Crear Alerta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon">
            <HistoryIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos Hoy</CardTitle>
            <AlertTriangleIcon className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Acción inmediata requerida</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 7 días</CardTitle>
            <ClockIcon className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Renovaciones programadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fidelización Lograda</CardTitle>
            <CheckCircle2Icon className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes ARL</CardTitle>
            <CalendarDaysIcon className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Visitas presenciales</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <ListIcon className="size-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDaysIcon className="size-4" />
              Calendario
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <InputGroup className="w-full sm:w-[250px]">
              <SearchIcon data-slot="icon" />
              <InputGroupInput placeholder="Buscar cliente..." />
            </InputGroup>
            <Select defaultValue="all">
              <SelectTrigger className="w-[130px]">
                <FilterIcon data-icon="inline-start" className="size-4" />
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Alerta</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReminders.map((reminder) => {
                    const PriorityIcon = priorityConfig[reminder.priority].icon
                    return (
                      <TableRow key={reminder.id} className="group cursor-pointer">
                        <TableCell>
                          <Badge variant="outline" className={cn("px-2 py-0 h-6 font-normal border", statusConfig[reminder.status])}>
                            {reminder.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PriorityIcon className={cn("size-3.5", reminder.priority === "Crítica" || reminder.priority === "Inmediata" ? "text-red-600" : "text-primary")} />
                            <span className="text-sm">{reminder.priority}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{reminder.client}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{reminder.type}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{reminder.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{format(reminder.dueDate, "dd MMM yyyy")}</span>
                            <span className={cn("text-[10px] font-bold uppercase", reminder.status === "Vencido" ? "text-red-600" : "text-muted-foreground")}>
                              {reminder.status === "Vencido" ? "Vencido" : "Faltan 12 días"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="size-8 text-green-600">
                              <CheckIcon className="size-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                                <MoreHorizontalIcon className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <MessageSquareIcon data-icon="inline-start" className="size-4" />
                                    Contactar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <EditIcon data-icon="inline-start" className="size-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <TrashIcon data-icon="inline-start" className="size-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <Card className="p-4">
              <Calendar
                mode="single"
                selected={date}
                className="rounded-md border-0 w-full flex justify-center scale-110 py-8"
              />
            </Card>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-sm px-1">Eventos del día</h3>
              <div className="flex flex-col gap-3">
                <div className="p-3 border rounded-xl bg-card hover:bg-muted/50 transition-colors border-l-4 border-l-red-600 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive" className="h-4 text-[9px] uppercase">Vencido</Badge>
                    <span className="text-[10px] text-muted-foreground italic">Hace 7 días</span>
                  </div>
                  <h4 className="text-sm font-bold truncate">María Fernanda Lopez</h4>
                  <p className="text-xs text-muted-foreground mt-1">Renovación SOAT</p>
                  <Button variant="link" className="p-0 h-auto text-[11px] mt-2 group">
                    Ver detalles <ChevronRightIcon className="size-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="p-3 border rounded-xl bg-card hover:bg-muted/50 transition-colors border-l-4 border-l-primary shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="h-4 text-[9px] uppercase border font-normal">Pendiente</Badge>
                    <span className="text-[10px] text-muted-foreground italic">Mañana</span>
                  </div>
                  <h4 className="text-sm font-bold truncate">Llamada de Seguimiento</h4>
                  <p className="text-xs text-muted-foreground mt-1">Prospecto: Juan Valdés</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
