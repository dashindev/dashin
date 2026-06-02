import React, { useEffect, useRef } from "react"

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export default function Modal({
  open,
  onClose,
  children,
  className = ""
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`rounded-bn border border-bn-border bg-content-box shadow-bn p-6 backdrop:bg-black/50 ${className}`}
    >
      {children}
    </dialog>
  )
}
