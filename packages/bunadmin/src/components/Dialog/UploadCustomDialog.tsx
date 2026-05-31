import React, { ChangeEventHandler, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { useTranslation } from "react-i18next"

interface Interface {
  openModal: number
  title?: string
  msg?: string
  onChange: ChangeEventHandler<any>
  accept?: string
}

export default function UploadConfirmDialog({
  openModal,
  title,
  msg,
  onChange,
  accept
}: Interface) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    if (openModal < 1) return
    setOpen(true)
  }, [openModal])

  const handleClose = () => {
    setOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<any>) => {
    onChange(e)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-[1300]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 max-sm:p-0 max-sm:items-stretch">
        <Dialog.Panel className="w-full max-w-sm rounded bg-content-box shadow-xl max-sm:max-w-none max-sm:rounded-none">
          <Dialog.Title className="px-6 pt-5 text-lg font-semibold">
            {title}
          </Dialog.Title>
          <div className="px-6 py-4 text-sm text-icon-muted">
            <p>{msg}</p>
          </div>
          <div className="flex justify-end gap-2 px-4 pb-3">
            <button
              autoFocus
              onClick={handleClose}
              className="rounded px-3 py-1.5 text-sm font-medium uppercase text-primary hover:bg-primary/10"
            >
              {t("Cancel")}
            </button>

            <input
              hidden
              accept={accept || "*"}
              id="icon-button-file"
              type="file"
              onChange={handleChange}
            />
            <label htmlFor="icon-button-file">
              <span className="inline-block cursor-pointer rounded px-3 py-1.5 text-sm font-medium uppercase text-primary hover:bg-primary/10">
                {t("Confirm")}
              </span>
            </label>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
