import React, { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { applyPreset, DEFAULT_PRESET } from "@/utils/themes/tokens"

/**
 * Light/dark theme toggle — calls applyPreset (the runtime token entrypoint).
 * Persists the choice; the same applyPreset() a future `ai theme` result uses.
 */
const KEY = "bn-theme-mode"

export default function ThemeToggle() {
  const [mode, setMode] = useState<"light" | "dark">("light")

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as "light" | "dark") || "light"
    setMode(saved)
    applyPreset(DEFAULT_PRESET, saved)
  }, [])

  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark"
    setMode(next)
    localStorage.setItem(KEY, next)
    applyPreset(DEFAULT_PRESET, next)
  }

  return (
    <button
      aria-label="toggle theme"
      onClick={toggle}
      className="inline-flex items-center justify-center rounded p-2 text-icon-muted hover:bg-primary/10"
    >
      {mode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
