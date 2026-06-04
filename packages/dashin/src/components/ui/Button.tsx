import React from "react"

type Variant = "primary" | "ghost" | "danger" | "outline" | "link"
type Size = "sm" | "md"

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-bn font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bn disabled:opacity-50 disabled:pointer-events-none"

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  outline: "border border-bn-border text-foreground hover:bg-primary/10",
  ghost: "text-icon-muted hover:bg-primary/10 hover:text-primary",
  danger: "text-danger hover:bg-danger/10",
  link: "text-primary hover:bg-primary/10"
}

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm"
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

/** Token-driven button (dark-mode aware via design tokens). */
export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
