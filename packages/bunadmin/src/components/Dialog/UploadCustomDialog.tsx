import React, { ChangeEventHandler, useEffect } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
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
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

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
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{msg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            {t("Cancel")}
          </Button>

          <input
            hidden
            accept={accept || "*"}
            id="icon-button-file"
            type="file"
            onChange={handleChange}
          />
          <label htmlFor="icon-button-file">
            <Button color="primary" component="span">
              {t("Confirm")}
            </Button>
          </label>
        </DialogActions>
      </Dialog>
    </div>
  )
}
