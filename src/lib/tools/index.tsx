"use client";

import {
  Users,
  UserRound,
  Package,
  Settings,
  UserPlus,
  Search,
  FileText,
  FileSearch,
  Receipt,
  ReceiptText,
  Bell,
  Target,
  Activity,
  Timer,
  Tags,
  LayoutDashboard,
  BellPlus,
  ArrowRightCircle,
  UserCog,
  ToggleRight,
  UserCheck,
  ClipboardPlus,
} from "lucide-react";
import { ReactNode } from "react";

export interface ToolMetadata {
  name: string;
  description: string;
  icon: ReactNode;
}

export const toolsMetadata: Record<string, ToolMetadata> = {
  // Read — Clientes
  get_clients: {
    name: "get_clients",
    description: "Lista todos los clientes del sistema con su información básica",
    icon: <Users className="w-4 h-4" />,
  },
  get_client_details: {
    name: "get_client_details",
    description: "Obtiene los detalles completos de un cliente específico",
    icon: <UserRound className="w-4 h-4" />,
  },
  get_prospects: {
    name: "get_prospects",
    description: "Lista prospectos con filtros por estado o fuente",
    icon: <UserPlus className="w-4 h-4" />,
  },
  get_prospect_details: {
    name: "get_prospect_details",
    description: "Obtiene detalles completos de un prospecto",
    icon: <Search className="w-4 h-4" />,
  },
  get_client_tags: {
    name: "get_client_tags",
    description: "Lista etiquetas de clientes o busca por etiqueta",
    icon: <Tags className="w-4 h-4" />,
  },

  // Read — Pólizas
  get_policies: {
    name: "get_policies",
    description: "Busca pólizas por tipo, estado o cliente",
    icon: <FileText className="w-4 h-4" />,
  },
  get_policy_details: {
    name: "get_policy_details",
    description: "Obtiene detalles completos de una póliza",
    icon: <FileSearch className="w-4 h-4" />,
  },
  get_expiring_policies: {
    name: "get_expiring_policies",
    description: "Pólizas próximas a vencer en un rango de días",
    icon: <Timer className="w-4 h-4" />,
  },

  // Read — Facturas
  get_invoices: {
    name: "get_invoices",
    description: "Lista facturas con filtros por estado o cliente",
    icon: <Receipt className="w-4 h-4" />,
  },
  get_invoice_details: {
    name: "get_invoice_details",
    description: "Obtiene detalles completos de una factura con ítems",
    icon: <ReceiptText className="w-4 h-4" />,
  },

  // Read — Seguimiento
  get_reminders: {
    name: "get_reminders",
    description: "Lista recordatorios con filtros por estado o prioridad",
    icon: <Bell className="w-4 h-4" />,
  },
  get_recent_activity: {
    name: "get_recent_activity",
    description: "Obtiene la actividad reciente del sistema",
    icon: <Activity className="w-4 h-4" />,
  },

  // Read — Servicios
  get_services: {
    name: "get_services",
    description: "Lista todos los servicios disponibles",
    icon: <Package className="w-4 h-4" />,
  },
  get_service_details: {
    name: "get_service_details",
    description: "Obtiene los detalles de un servicio específico",
    icon: <Settings className="w-4 h-4" />,
  },

  // Read — Métricas
  get_goals: {
    name: "get_goals",
    description: "Lista metas comerciales con progreso",
    icon: <Target className="w-4 h-4" />,
  },
  get_dashboard_summary: {
    name: "get_dashboard_summary",
    description: "Resumen ejecutivo del estado del negocio",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },

  // Write
  create_reminder: {
    name: "create_reminder",
    description: "Crea un recordatorio o alerta",
    icon: <BellPlus className="w-4 h-4" />,
  },
  create_prospect: {
    name: "create_prospect",
    description: "Registra un nuevo prospecto",
    icon: <UserPlus className="w-4 h-4" />,
  },
  update_prospect_status: {
    name: "update_prospect_status",
    description: "Actualiza el estado de un prospecto",
    icon: <ArrowRightCircle className="w-4 h-4" />,
  },
  update_client_status: {
    name: "update_client_status",
    description: "Actualiza el estado de un cliente",
    icon: <UserCog className="w-4 h-4" />,
  },
  update_policy_status: {
    name: "update_policy_status",
    description: "Actualiza el estado de una póliza",
    icon: <ToggleRight className="w-4 h-4" />,
  },
  convert_prospect_to_client: {
    name: "convert_prospect_to_client",
    description: "Convierte un prospecto en cliente",
    icon: <UserCheck className="w-4 h-4" />,
  },
  log_activity: {
    name: "log_activity",
    description: "Registra una actividad en el sistema",
    icon: <ClipboardPlus className="w-4 h-4" />,
  },
};

export const toolNames = Object.keys(toolsMetadata);
