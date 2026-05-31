import React, { ReactElement, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { Translation } from "react-i18next"

interface Interface {
  openModal: number
  title?: string | ReactElement
  msg?: string | ReactElement
  content?: ReactElement
  doFunc: () => void
  disagree?: string | ReactElement
  agree?: string | ReactElement
}

export default function ConfirmDialog({
  openModal,
  title,
  msg,
  content,
  doFunc,
  disagree,
  agree
}: Interface) {
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    if (openModal < 1) return
    setOpen(true)
  }, [openModal])

  const handleClose = () => setOpen(false)

  const handleAgree = () => {
    doFunc()
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-[1300]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 max-sm:p-0 max-sm:items-stretch">
        <Dialog.Panel className="w-full max-w-sm rounded bg-white shadow-xl max-sm:max-w-none max-sm:rounded-none">
          <Dialog.Title className="px-6 pt-5 text-lg font-semibold">
            {title}
          </Dialog.Title>
          <div className="px-6 py-4 text-sm text-gray-600">
            {content || <p>{msg}</p>}
          </div>
          <div className="flex justify-end gap-2 px-4 pb-3">
            <button
              autoFocus
              onClick={handleClose}
              className="rounded px-3 py-1.5 text-sm font-medium uppercase text-primary hover:bg-primary/10"
            >
              {disagree || <Translation>{t => t("Cancel")}</Translation>}
            </button>
            <button
              onClick={handleAgree}
              className="rounded px-3 py-1.5 text-sm font-medium uppercase text-primary hover:bg-primary/10"
            >
              {agree || <Translation>{t => t("Confirm")}</Translation>}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
