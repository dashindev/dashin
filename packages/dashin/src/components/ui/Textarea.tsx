import React from "react"

const cls =
  "rounded-bn border border-bn-border bg-content-box px-2.5 py-1.5 text-sm text-foreground placeholder:text-icon-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-bn resize-y"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`${cls} ${className}`} {...props} />
  )
)
Textarea.displayName = "Textarea"
export default Textarea
