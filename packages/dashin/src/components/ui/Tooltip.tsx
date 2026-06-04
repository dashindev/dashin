import React, { useState } from "react"

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  className?: string
}

export default function Tooltip({ content, children, className = "" }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-bn bg-foreground text-content-bg px-2 py-1 text-xs shadow-bn ${className}`}
        >
          {content}
        </span>
      )}
    </span>
  )
}
