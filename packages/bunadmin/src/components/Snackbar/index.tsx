import React from "react"
import { withSnackbar, WithSnackbarProps } from "notistack"
import { useSelector } from "react-redux"
import { selectNotice } from "@/slices/noticeSlice"

function Snackbar(props: WithSnackbarProps) {
  const notice = useSelector(selectNotice)

  React.useEffect(() => {
    if (notice.title === "init-notice") return

    props.enqueueSnackbar(notice.title, {
      variant: notice.severity || "success"
    })
  }, [notice.key])

  return null
}

export default withSnackbar(Snackbar)
