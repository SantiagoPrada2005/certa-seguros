import { SectionCard } from "@/components/admin/section-card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlusIcon, FolderTreeIcon } from "lucide-react";
import { ServiciosTable } from "@/components/admin/servicios/servicios-table";
import { NuevoServicioDialog } from "@/components/admin/servicios/nuevo-servicio-dialog";
import prisma from "@/lib/prisma";

export default async function ServiciosPage() {
  const [total, activos, inactivos] = await Promise.all([
    prisma.service.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.service.count({ where: { isActive: false } }),
  ]);

  const initialServices = await prisma.service.findMany({
    include: {
      subcategory: {
        include: { category: true },
      },
    },
    orderBy: { name: "asc" },
  });

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
          {/* Nueva Categoría — static dialog, sin API en esta iteración */}
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              <FolderPlusIcon data-icon="inline-start" />
              Nueva Categoría
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Categoría</DialogTitle>
                <DialogDescription>
                  Define una nueva categoría principal para agrupar servicios relacionados.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel htmlFor="cat-nombre">Nombre de Categoría</FieldLabel>
                  <Input id="cat-nombre" placeholder="Ej. Seguros de Vida" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cat-desc">Descripción (Opcional)</FieldLabel>
                  <Textarea id="cat-desc" placeholder="Breve explicación del alcance..." className="min-h-[80px]" />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="submit">Crear Categoría</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Nueva Subcategoría */}
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              <FolderTreeIcon data-icon="inline-start" />
              Nueva Subcategoría
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Subcategoría</DialogTitle>
                <DialogDescription>
                  Crea una división específica dentro de una categoría existente.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel htmlFor="sub-nombre">Nombre de Subcategoría</FieldLabel>
                  <Input id="sub-nombre" placeholder="Ej. Accidentes Personales" />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="submit">Crear Subcategoría</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <NuevoServicioDialog />
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
          value="—"
          footerTitle="Ver catálogo completo"
        />
      </div>

      {/* Table — Client Component */}
      <ServiciosTable initialServices={initialServices as any} />
    </div>
  );
}
