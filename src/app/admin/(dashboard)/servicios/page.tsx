import { SectionCard } from "@/components/admin/section-card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ServiciosTable } from "@/components/admin/servicios/servicios-table";
import { NuevoServicioDialog } from "@/components/admin/servicios/nuevo-servicio-dialog";
import { NuevaCategoriaDialog } from "@/components/admin/servicios/nueva-categoria-dialog";
import { NuevaSubcategoriaDialog } from "@/components/admin/servicios/nueva-subcategoria-dialog";
import prisma from "@/lib/prisma";

export default async function ServiciosPage() {
  const [total, activos, inactivos] = await Promise.all([
    prisma.service.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.service.count({ where: { isActive: false } }),
  ]);

  const categories = await prisma.serviceCategory.findMany({
    include: { subcategories: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  const servicesRaw = await prisma.service.findMany({
    include: {
      subcategory: {
        include: { category: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const initialServices = servicesRaw.map(s => ({
    ...s,
    price: s.price ? s.price.toNumber() : null
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Servicios</h1>
          <p className="mt-2 text-muted-foreground">
            Administra los servicios, seguros y asesorías que ofreces a tus clientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NuevaCategoriaDialog />
          <NuevaSubcategoriaDialog categories={categories} />
          <NuevoServicioDialog categories={categories} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <SectionCard
          title="Total Servicios"
          value={total.toLocaleString("es-CO")}
          footerTitle="En catálogo"
        />
        <SectionCard
          title="Servicios Activos"
          value={activos.toLocaleString("es-CO")}
          trend="up"
          trendValue="Disponibles"
          footerTitle="Estado: isActive = true"
        />
        <SectionCard
          title="Servicios Inactivos"
          value={inactivos.toLocaleString("es-CO")}
          trend="down"
          trendValue={inactivos > 0 ? "Requieren revisión" : "Sin problemas"}
          footerTitle="Estado: isActive = false"
        />
        <SectionCard
          title="Categorías"
          value={categories.length.toLocaleString("es-CO")}
          footerTitle="Ver catálogo completo"
        />
      </div>

      {/* Table — Client Component */}
      <ServiciosTable initialServices={initialServices as any} categories={categories} />
    </div>
  );
}
