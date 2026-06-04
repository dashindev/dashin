import React, { useState, useRef, useEffect } from "react"

export interface DropdownItem {
  label: string
  onClick?: () => void
  disabled?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  className?: string
}

export default function Dropdown({ trigger, items, className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <span onClick={() => setOpen(!open)}>{trigger}</span>
      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[8rem] rounded-bn border border-bn-border bg-content-box py-1 shadow-bn">
          {items.map((item, i) => (
            <button
              key={i}
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.()
                setOpen(false)
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-primary/10 disabled:opacity-50 disabled:pointer-events-none"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
