# Estructura de Implementación — Certa Seguros CRM

Este documento detalla la arquitectura técnica, la estructura de la base de datos y los patrones de diseño utilizados en el desarrollo del CRM de Certa Seguros.

## 🚀 Stack Tecnológico

- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS con [shadcn/ui](https://ui.shadcn.com/) para componentes consistentes.
- **Base de Datos**: PostgreSQL (hospedado en Neon)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Autenticación**: Firebase Auth integrado con perfiles de usuario en la DB local.
- **Despliegue**: Vercel
- **Gestión de Paquetes**: pnpm

---

## 🛠️ Metodología de Desarrollo

El proyecto sigue una metodología de desarrollo moderna basada en la eficiencia, la seguridad de tipos y la propiedad del código UI.

### 1. Arquitectura de Componentes (shadcn/ui)
No utilizamos bibliotecas de componentes externas como dependencias de terceros. La metodología consiste en:
- **Source Ownership**: Los componentes se integran directamente en `src/components/ui` mediante la CLI de shadcn, permitiendo personalización total sin restricciones de librerías "caja negra".
- **Composición Semántica**: Uso de tokens semánticos (`bg-background`, `text-primary`) para garantizar coherencia visual y soporte nativo de temas.
- **Patrones de Formulario**: Implementación estricta de `FieldGroup`, `Field` y `FieldLabel` para mantener la accesibilidad y el orden visual en interfaces administrativas complejas.

### 2. Flujo de Datos y Reactivity (Next.js 15+)
- **RSC (React Server Components)**: La mayoría de las páginas y componentes de datos son Server Components por defecto para minimizar el JavaScript enviado al cliente y mejorar el SEO/rendimiento.
- **Server Actions**: Todas las mutaciones (POST, PUT, DELETE) se manejan mediante funciones asíncronas con la directiva `"use server"`. Esto elimina la necesidad de gestionar estados de carga manuales complejos y endpoints de API redundantes.
- **Revalidación Primaria**: Uso de `revalidatePath` para asegurar que el usuario vea datos frescos inmediatamente después de una acción sin recargas completas de página.

### 3. Validación y Seguridad de Tipos
- **Schema-First Validation**: Cada Server Action está protegida por un esquema de **Zod**. La validación ocurre en el servidor antes de tocar la base de datos, garantizando la integridad de los datos.
- **Type Safety de Extremo a Extremo**: Los tipos generados por Prisma se propagan desde la base de datos hasta los componentes de la interfaz de usuario, minimizando errores en tiempo de ejecución.
- **Zod + Prisma Client**: Sincronización manual de tipos entre los esquemas de validación de formularios y los modelos de datos de Prisma.

### 4. Gestión de Estado y Rendimiento
- **Estado en la URL**: Se prefiere el uso de `searchParams` para filtrar y ordenar tablas, permitiendo que las vistas sean compartibles y compatibles con el renderizado en servidor.
- **Suspense & Streaming**: Uso estratégico de boundaries de `Suspense` para cargar widgets pesados de forma independiente, manteniendo el dashboard interactivo.

---

## 🏗️ Arquitectura de la Base de Datos (Prisma)

Se ha diseñado un esquema relacional robusto centrado en la entidad `Client`.

### Entidades Principales

1.  **Client (Prospectos y Clientes)**:
    - Se unificó la gestión de prospectos y clientes en una sola tabla.
    - El enum `ClientStatus` gestiona el ciclo de vida desde `NUEVO` hasta `ACTIVO` o `DESCARTADO`.
2.  **User**:
    - Perfil vinculado a Firebase Auth mediante `firebaseUid`.
3.  **Service / Policy / Invoice**:
    - Relaciones integradas para trazabilidad completa de cada póliza y su facturación.

### Detalles Técnicos Importantes
- **Precisión Financiera**: Uso de `Decimal` (`db.Decimal(15, 2)`) en Prisma para evitar imprecisiones en cálculos de primas e impuestos.
- **Índices**: Optimización mediante `@@index` en campos de búsqueda frecuente (documentNumber, email, status).

---

## 🛡️ Estándares y Herramientas

- **Package Manager**: Uso exclusivo de **pnpm** para gestión de dependencias rápida y eficiente.
- **Autenticación**: Firebase Auth para la gestión de identidad, sincronizado con perfiles locales para control de roles (`ADMIN`, `ASESOR`).
- **Despliegue**: CD continuo en Vercel con validación de tipos y linting obligatorio en el build.

