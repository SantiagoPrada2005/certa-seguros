"use client"

import * as React from "react"
import { UsersIcon, BellIcon, ExternalLinkIcon, ShieldCheckIcon, BriefcaseIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@certaseguros.com",
    avatar: "",
  },
  navMain: [
    {
      title: "CRM",
      url: "/admin",
      icon: <UsersIcon />,
      isActive: true,
      items: [
        {
          title: "Prospectos",
          url: "/admin",
        },
        {
          title: "Servicios",
          url: "/admin/servicios",
          icon: <BriefcaseIcon className="size-4" />,
        },
      ],
    },
    {
      title: "Gestión y Alertas",
      url: "/admin/recordatorios",
      icon: <BellIcon />,
      badge: <Badge variant="destructive" className="h-4 px-1 text-[10px] min-w-4 flex items-center justify-center">1</Badge>,
      items: [
        {
          title: "Recordatorios",
          url: "/admin/recordatorios",
          badge: <Badge variant="destructive" className="h-4 px-1 text-[10px] min-w-4 flex items-center justify-center">1</Badge>,
        },
      ],
    },
  ],
  projects: [
    {
      name: "Cotizador Sura",
      url: "https://www.suraenlinea.com/",
      icon: <ExternalLinkIcon />,
    },
    {
      name: "Grupo Solidaria",
      url: "https://solidaria.com.co/",
      icon: <ExternalLinkIcon />,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/admin" />}>
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ShieldCheckIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Certa Seguros</span>
                <span className="truncate text-xs">CRM Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
