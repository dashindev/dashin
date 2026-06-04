import React from "react"

export type CardProps = React.HTMLAttributes<HTMLDivElement>

/** Token-driven surface card (border + elevation via design tokens). */
export default function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-bn border border-bn-border bg-content-box shadow-bn ${className}`}
      {...props}
    />
  )
}
