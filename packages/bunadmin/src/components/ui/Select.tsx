import React from "react"

const cls =
  "w-full rounded-bn border border-bn-border bg-content-box px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-bn"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

/** Token-driven native select. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`${cls} ${className}`} {...props}>
      {children}
    </select>
  )
)
Select.displayName = "Select"
export default Select
