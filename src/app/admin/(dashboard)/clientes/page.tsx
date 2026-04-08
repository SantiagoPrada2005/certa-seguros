import { getClients, getAvailableServices } from "./actions"
import { ClientesClient } from "./clientes-client"

export const metadata = {
  title: "Clientes | Certa Seguros",
  description: "Gestión de clientes y servicios",
}

export default async function ClientesPage() {
  const [clientsResult, servicesResult] = await Promise.all([
    getClients(),
    getAvailableServices()
  ])

  const initialClients = clientsResult.success && clientsResult.data ? clientsResult.data : []
  const availableServices = servicesResult.success && servicesResult.data ? servicesResult.data : []

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Directorio de Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona la relación con tus clientes, pólizas y servicios adicionales.
          </p>
        </div>
      </div>

      <ClientesClient 
        initialClients={initialClients} 
        availableServices={availableServices} 
      />
    </div>
  )
}
