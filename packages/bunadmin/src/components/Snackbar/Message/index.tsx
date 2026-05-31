import React, { useState } from "react"
import { EnhancedStore, AnyAction } from "@reduxjs/toolkit"
import { ThunkMiddlewareFor } from "@reduxjs/toolkit/src/getDefaultMiddleware"
import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack"
import { SeverityType } from "@/core/notice/types"
import { useSelector } from "react-redux"
import { selectNotice, toggleNotifyDrawer } from "@/slices/noticeSlice"
import { useTranslation } from "react-i18next"

interface State {
  severity?: SeverityType
  content?: string | null
}

type Props = {
  store: EnhancedStore<any, AnyAction, [ThunkMiddlewareFor<any>]>
  id: SnackbarKey
  message: SnackbarMessage
}

const gradients: Record<string, string> = {
  success: "from-green-400/90 to-gray-300/90",
  error: "from-red-400/90 to-gray-300/90",
  warning: "from-amber-400/90 to-gray-300/90",
  info: "from-sky-400/90 to-gray-300/90"
}

const SnackMessage = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { t } = useTranslation()
  const notice = useSelector(selectNotice)
  const { closeSnackbar } = useSnackbar()
  const [expanded, setExpanded] = useState(false)
  const [state, setState] = useState<State>({})

  React.useEffect(() => {
    setState({
      severity: notice.severity || "success",
      content: notice.content
    })
  }, [notice])

  const handleDismiss = () => closeSnackbar(props.id)

  return (
    <div
      ref={ref}
      className={`min-w-[344px] max-w-[400px] rounded bg-gradient-to-br text-white shadow-md ${
        gradients[state.severity || "success"]
      }`}
    >
      <div className="flex items-center justify-between py-2 pl-4 pr-2">
        <span className="text-sm font-bold">{props.message}</span>
        <div className="flex">
          {state.content && (
            <button
              aria-label="Show more"
              onClick={() => setExpanded(!expanded)}
              className={`p-2 transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              ⌄
            </button>
          )}
          <button onClick={handleDismiss} className="p-2">
            ✕
          </button>
        </div>
      </div>
      {expanded && state.content && (
        <div className="bg-content-box p-4 text-foreground">
          <p className="mb-2">{state.content}</p>
          <button
            onClick={() => props.store.dispatch(toggleNotifyDrawer())}
            className="flex items-center text-sm text-icon-muted hover:text-icon-muted"
          >
            <span className="pr-1">↗</span>
            {t("Open List")}
          </button>
        </div>
      )}
    </div>
  )
})

export default SnackMessage
