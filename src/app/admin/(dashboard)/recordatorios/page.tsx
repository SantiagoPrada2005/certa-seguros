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

const mockReminders = [
  {
    id: 1,
    client: "Transportes Andinos S.A.",
    type: "Renovación Póliza Vehicular",
    dueDate: "15 Oct 2026",
    daysLeft: 12, // assuming alert triggers 330 days after creation (11 months)
    severity: "destructive", // upcoming tight deadline
    description: "Vencimiento anual de pólizas (flota 5 vehículos). Contactar a Gerencia para renovación.",
  },
  {
    id: 2,
    client: "Constructora Horizonte",
    type: "Seguimiento Presencial ARL",
    dueDate: "20 Nov 2026",
    daysLeft: 45, // tracking 6 months visit
    severity: "warning", // Upcoming
    description: "Visita periódica ARL requerida. Confirmar fecha con líder SST.",
  },
  {
    id: 3,
    client: "María Fernanda Lopez",
    type: "Renovación SOAT",
    dueDate: "25 Sep 2026",
    daysLeft: -7, // Overdue
    severity: "default", 
    description: "Renovación atrasada. Urgente contactar al cliente.",
  },
]

export default function RemindersDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recordatorios y Alertas</h1>
        <p className="text-muted-foreground mt-2">
          Motor preventivo para fidelización. Renueva a tiempo y no pierdas comisiones.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Póliza/SOAT (11 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Esperando acción pronto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Seguimiento ARL (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Visitas presenciales programables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos / Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
            <p className="text-xs text-muted-foreground">Requieren intervención urgente</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado Activo de Tareas</CardTitle>
          <CardDescription>
            Clientes que requieren contacto inminente debido a un próximo vencimiento de póliza o revisión ARL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo Alerta</TableHead>
                <TableHead>Fecha Venc. / Meta</TableHead>
                <TableHead>Descripción / Tarea</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell>
                    <Badge variant={
                      reminder.daysLeft < 0 ? "destructive" :
                      reminder.severity === "destructive" ? "destructive" :
                      reminder.severity === "warning" ? "secondary" : "default"
                    }>
                      {reminder.daysLeft < 0 ? "¡Vencido!" : `${reminder.daysLeft} días restantes`}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{reminder.client}</TableCell>
                  <TableCell>{reminder.type}</TableCell>
                  <TableCell>{reminder.dueDate}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                    {reminder.description}
                  </TableCell>
                </TableRow>
              ))}
              {mockReminders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Todo al día. No hay recordatorios activos en este momento.
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
