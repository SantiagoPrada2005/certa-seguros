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

const mockProspects = [
  {
    id: 1,
    name: "Transportes Andinos S.A.",
    document: "NIT 900.123.456-7",
    email: "gerencia@transportesandinos.com",
    phone: "310 123 4567",
    services: ["Póliza Vehicular", "Asesoría Tránsito"],
  },
  {
    id: 2,
    name: "María Fernanda Lopez",
    document: "CC 1.053.456.789",
    email: "mafe.lopez@email.com",
    phone: "312 987 6543",
    services: ["SOAT", "Seguro de Vida"],
  },
  {
    id: 3,
    name: "Constructora Horizonte",
    document: "NIT 800.987.654-3",
    email: "proyectos@horizonte.co",
    phone: "320 555 4433",
    services: ["ARL", "Póliza Todo Riesgo"],
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prospectos</h1>
        <p className="text-muted-foreground mt-2">
          Gestión centralizada de clientes y prospectos capturados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base de Datos Principal</CardTitle>
          <CardDescription>
            Lista de prospectos esperando ser contactados. No se permite contacto directo por WhatsApp desde la página pública.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre / Razón Social</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead>Servicios de Interés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProspects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">{prospect.name}</TableCell>
                  <TableCell>{prospect.document}</TableCell>
                  <TableCell>{prospect.email}</TableCell>
                  <TableCell>{prospect.phone}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prospect.services.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
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
        </CardContent>
      </Card>
    </div>
  )
}
