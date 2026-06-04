import React, { useState } from "react"

export interface Tab {
  label: string
  content: React.ReactNode
}

export interface TabsProps {
  tabs: Tab[]
  defaultIndex?: number
  className?: string
}

export default function Tabs({ tabs, defaultIndex = 0, className = "" }: TabsProps) {
  const [active, setActive] = useState(defaultIndex)

  return (
    <div className={className}>
      <div role="tablist" className="flex border-b border-bn-border">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              i === active
                ? "border-primary text-primary"
                : "border-transparent text-icon-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-3">
        {tabs[active]?.content}
      </div>
    </div>
  )
}
