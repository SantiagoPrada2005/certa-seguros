"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  badge?: React.ReactNode
  items?: {
    title: string
    url: string
    badge?: React.ReactNode
  }[]
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMainItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavMainItem({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isSubItemActive = item.items?.some((subItem) => pathname === subItem.url)
  const isActive = pathname === item.url || isSubItemActive
  
  // Controlled state for the collapsible
  const [isOpen, setIsOpen] = React.useState(isActive)

  // Sync state if the route becomes active (auto-expand)
  React.useEffect(() => {
    if (isActive) {
      setIsOpen(true)
    }
  }, [isActive])

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} isActive={isActive} />}
      >
        {item.icon}
        <span>{item.title}</span>
        {item.badge && <div className="ml-auto">{item.badge}</div>}
        <ChevronRightIcon className={`ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90 ${item.badge ? 'hidden group-data-open/collapsible:block' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton 
                render={<Link href={subItem.url} />} 
                isActive={pathname === subItem.url}
              >
                <span>{subItem.title}</span>
                {subItem.badge && <div className="ml-auto">{subItem.badge}</div>}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
