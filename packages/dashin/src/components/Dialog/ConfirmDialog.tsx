import React, { ReactElement, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { Translation } from "react-i18next"
import Button from "../ui/Button"

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
        <Dialog.Panel className="w-full max-w-sm rounded bg-content-box shadow-bn max-sm:max-w-none max-sm:rounded-none">
          <Dialog.Title className="px-6 pt-5 text-lg font-semibold">
            {title}
          </Dialog.Title>
          <div className="px-6 py-4 text-sm text-icon-muted">
            {content || <p>{msg}</p>}
          </div>
          <div className="flex justify-end gap-2 px-4 pb-3">
            <Button variant="link" autoFocus onClick={handleClose} className="uppercase">
              {disagree || <Translation>{t => t("Cancel")}</Translation>}
            </Button>
            <Button variant="link" onClick={handleAgree} className="uppercase">
              {agree || <Translation>{t => t("Confirm")}</Translation>}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
