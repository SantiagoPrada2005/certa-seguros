"use client"

import { PaletteIcon, CheckIcon, SunIcon, MoonIcon, MonitorIcon } from "lucide-react"
import { useAdminTheme } from "./admin-theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const themes = [
  { id: "neutral", label: "Estándar" },
  { id: "blue", label: "Océano" },
  { id: "green", label: "Esmeralda" },
  { id: "ruby", label: "Carmesí" },
] as const

const modes = [
  { id: "light", label: "Claro", icon: SunIcon },
  { id: "dark", label: "Oscuro", icon: MoonIcon },
] as const

export function AdminThemeSwitcher() {
  const { theme, mode, setTheme, setMode } = useAdminTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-dashed">
          <PaletteIcon className="h-4 w-4" />
          <span className="sr-only">Cambiar tema visual</span>
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Colores</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themes.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{t.label}</span>
              {theme === t.id && <CheckIcon className="h-4 w-4 opacity-50" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Modo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {modes.map((m) => (
            <DropdownMenuItem
              key={m.id}
              onClick={() => setMode(m.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <m.icon className="h-4 w-4 opacity-50" />
                <span>{m.label}</span>
              </div>
              {mode === m.id && <CheckIcon className="h-4 w-4 opacity-50" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
