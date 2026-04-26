"use client";

import { 
  Users, 
  UserRound, 
  Package, 
  Settings 
} from "lucide-react";
import { ReactNode } from "react";

export interface ToolMetadata {
  name: string;
  description: string;
  icon: ReactNode;
}

export const toolsMetadata: Record<string, ToolMetadata> = {
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
};

export const toolNames = Object.keys(toolsMetadata);