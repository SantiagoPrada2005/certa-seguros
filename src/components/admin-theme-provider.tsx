"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "neutral" | "blue" | "green" | "ruby"
type Mode = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  mode: Mode
  setTheme: (theme: Theme) => void
  setMode: (mode: Mode) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "neutral",
  mode: "light",
  setTheme: () => null,
  setMode: () => null,
})

interface AdminThemeProviderProps {
  children: React.ReactNode
  initialTheme?: Theme
  initialMode?: Mode
}

const COOKIE_NAME_THEME = "certa-admin-theme"
const COOKIE_NAME_MODE = "certa-admin-mode"

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
}

export function AdminThemeProvider({ 
  children, 
  initialTheme = "neutral", 
  initialMode = "light" 
}: AdminThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [mode, setModeState] = useState<Mode>(initialMode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    setCookie(COOKIE_NAME_THEME, newTheme)
  }

  const setMode = (newMode: Mode) => {
    setModeState(newMode)
    setCookie(COOKIE_NAME_MODE, newMode)
  }

  // Si estamos montados, usamos el estado actual. 
  // Si no (durante hidratación), usamos los valores iniciales del servidor.
  const currentTheme = mounted ? theme : initialTheme
  const currentMode = mounted ? mode : initialMode

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      <div 
        className={`admin-theme-wrapper theme-${currentTheme} ${currentMode === "dark" ? "dark" : ""} min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useAdminTheme = () => useContext(ThemeContext)
