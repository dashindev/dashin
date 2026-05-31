import React from "react"
import { useSnackbar } from "notistack"
import { useSelector } from "react-redux"
import { selectNotice } from "@/slices/noticeSlice"

export default function Snackbar() {
  const notice = useSelector(selectNotice)
  const { enqueueSnackbar } = useSnackbar()

  React.useEffect(() => {
    if (notice.title === "init-notice") return

    enqueueSnackbar(notice.title, {
      variant: notice.severity || "success"
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice.key])

  return null
}
