import { SectionCard } from "@/components/admin/section-card"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { PlusIcon, BriefcaseIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <SectionCard
        title="Total Comisiones"
        value="$12,450.00"
        trend="up"
        trendValue="+12.5%"
        footerTitle="Tendencia al alza este mes"
        footerDescription="Basado en los últimos 6 meses"
      />
      <SectionCard
        title="Nuevos Servicios"
        value="24"
        trend="down"
        trendValue="-5%"
        footerTitle="Bajó un 5% este periodo"
        footerDescription="Requiere atención comercial"
      />
      <SectionCard
        title="Servicios Activos"
        value="156"
        trend="up"
        trendValue="+8%"
        footerTitle="Retención de clientes sólida"
        footerDescription="Superando expectativas"
      />
      <SectionCard
        title="Tasa de Crecimiento"
        value="4.5%"
        trend="up"
        trendValue="+4.5%"
        footerTitle="Aumento constante"
        footerDescription="Cumple con proyecciones"
      />
    </div>
  )
}

const mockServicios = [
  {
    id: 1,
    nombre: "Seguro de Vehículo Todo Riesgo",
    descripcion: "Cobertura completa para vehículos en caso de accidentes, daños a terceros o robos.",
    vigencia: "Anual",
    valor: "$1,200,000",
    categoria: "Seguros",
    subcategoria: "Movilidad",
  },
  {
    id: 2,
    nombre: "Asesoría Legal Laboral",
    descripcion: "Consultoría especializada de 2 horas para revisión de contratos y normatividad laboral.",
    vigencia: "Única vez",
    valor: "$200,000",
    categoria: "Asesorías",
    subcategoria: "Legal",
  },
  {
    id: 3,
    nombre: "Póliza de Salud Integral",
    descripcion: "Atención médica hospitalaria y ambulatoria. Incluye red de urgencias.",
    vigencia: "Anual",
    valor: "Depende del perfil",
    categoria: "Seguros",
    subcategoria: "Salud",
  },
  {
    id: 4,
    nombre: "Actualización Sistema SST",
    descripcion: "Auditoría y puesta a punto del Sistema de Seguridad y Salud en el Trabajo.",
    vigencia: "Periódico (Mensual)",
    valor: "$500,000 / mes",
    categoria: "Servicios",
    subcategoria: "SST",
  },
]

export default function ServiciosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Servicios</h1>
          <p className="mt-2 text-muted-foreground">
            Administra los servicios, seguros y asesorías que ofreces a tus clientes.
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <PlusIcon data-icon="inline-start" />
            Nuevo Servicio
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Servicio</DialogTitle>
              <DialogDescription>
                Ingresa los detalles del nuevo servicio para añadirlo al catálogo activo.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" placeholder="Ej. Seguro Todo Riesgo" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  placeholder="Detalles sobre lo que incluye y no incluye el servicio..." 
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vigencia">Vigencia / Duración</Label>
                  <Input id="vigencia" placeholder="Ej. Anual" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="valor">Valor (Opcional)</Label>
                  <Input id="valor" placeholder="Ej. 1500000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="seguros">Seguros</SelectItem>
                        <SelectItem value="asesorias">Asesorías</SelectItem>
                        <SelectItem value="servicios">Servicios Adicionales</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subcategoria">Subcategoría (Opcional)</Label>
                  <Select>
                    <SelectTrigger id="subcategoria">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="movilidad">Movilidad</SelectItem>
                        <SelectItem value="salud">Salud</SelectItem>
                        <SelectItem value="vida">Vida</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="sst">SST</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Servicio</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <SectionCards />

      <Card>
        <CardHeader>
          <CardTitle>Listado de Servicios</CardTitle>
          <CardDescription>
            Visualiza y administra todos los servicios categorizados disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead className="w-[120px]">Categoría</TableHead>
                <TableHead className="w-[120px]">Subcategoría</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockServicios.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{servicio.nombre}</span>
                      <span className="text-muted-foreground line-clamp-1 text-xs max-w-[300px]" title={servicio.descripcion}>
                        {servicio.descripcion}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{servicio.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    {servicio.subcategoria ? (
                      <Badge variant="outline">{servicio.subcategoria}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {servicio.vigencia}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {servicio.valor || "-"}
                  </TableCell>
                </TableRow>
              ))}
              {mockServicios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No hay servicios creados todavía.
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
