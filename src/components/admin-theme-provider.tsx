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

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("neutral")
  const [mode, setModeState] = useState<Mode>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check locally saved theme
    const savedTheme = localStorage.getItem("certa-admin-theme") as Theme
    if (savedTheme && ["neutral", "blue", "green", "ruby"].includes(savedTheme)) {
      setThemeState(savedTheme)
    }

    // Check locally saved mode
    const savedMode = localStorage.getItem("certa-admin-mode") as Mode
    if (savedMode && ["light", "dark"].includes(savedMode)) {
      setModeState(savedMode)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Default to system preference if no saved mode
      setModeState("dark")
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("certa-admin-theme", newTheme)
  }

  const setMode = (newMode: Mode) => {
    setModeState(newMode)
    localStorage.setItem("certa-admin-mode", newMode)
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      <div 
        className={`admin-theme-wrapper ${mounted ? `theme-${theme} ${mode === "dark" ? "dark" : ""}` : "theme-neutral"} min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useAdminTheme = () => useContext(ThemeContext)
