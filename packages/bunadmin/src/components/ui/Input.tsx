import React from "react"

const cls =
  "w-full rounded-bn border border-bn-border bg-content-box px-2.5 py-1.5 text-sm text-foreground placeholder:text-icon-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-bn"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

/** Token-driven text input. */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${cls} ${className}`} {...props} />
  )
)
Input.displayName = "Input"
export default Input
