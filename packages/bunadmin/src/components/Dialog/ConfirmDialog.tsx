import React, { ReactElement, useEffect } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
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
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    if (openModal < 1) return
    setOpen(true)
  }, [openModal])

  const handleClose = () => {
    setOpen(false)
  }

  const handleAgree = () => {
    doFunc()
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
          {content || <DialogContentText>{msg}</DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            {disagree || <Translation>{t => t("Cancel")}</Translation>}
          </Button>
          <Button onClick={handleAgree} color="primary" autoFocus>
            {agree || <Translation>{t => t("Confirm")}</Translation>}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
