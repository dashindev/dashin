import React from "react"

type Size = "sm" | "md" | "lg"

const sizes: Record<Size, string> = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base"
}

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: Size
}

export default function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className = "",
  ...props
}: AvatarProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-primary/15 text-primary font-medium overflow-hidden ${sizes[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        (fallback ?? "?")
      )}
    </span>
  )
}
