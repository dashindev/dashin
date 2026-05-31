import React, { useEffect, useState } from "react"
import { EnhancedStore, AnyAction } from "@reduxjs/toolkit"
import { ThunkMiddlewareFor } from "@reduxjs/toolkit/src/getDefaultMiddleware"
import { ENV, NoticePlugin } from "@/utils"
import NoticeContainer from "@/core/notice"
import { toggleNotifyDrawer } from "@/slices/noticeSlice"

type Props = {
  store: EnhancedStore<any, AnyAction, [ThunkMiddlewareFor<any>]>
} & NoticePlugin

export default function NoticeMenu(props: Props) {
  const [intervalID, setIntervalID] = useState<NodeJS.Timeout>()
  const ref = React.useRef()
  const [count, setCount] = useState(0)

  const handleMenu = async (_event: React.MouseEvent<HTMLElement>) => {
    props.store.dispatch(toggleNotifyDrawer())
  }

  async function queryCount() {
    const { notificationCount }: NoticePlugin = props
    try {
      if (!notificationCount) return
      const count = await notificationCount()
      setCount(Number(count))
    } catch (e) {
      // console.error(e)
    }
  }

  useEffect(() => {
    ;(async () => {
      await queryCount()
    })()
  }, [])

  useEffect(() => {
    if (!ENV.ON_NOTIFICATION_INTERVAL_COUNT) {
      return
    }

    ;(async () => {
      const { notificationCount }: NoticePlugin = props
      if (!notificationCount) return
    })()

    if (intervalID) return () => clearInterval(intervalID)

    const id = setInterval(async () => {
      await queryCount()
    }, 3000)

    setIntervalID(id)
  }, [ref.current])

  return (
    <div>
      <button
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        className="relative inline-flex items-center justify-center rounded p-2 text-icon-muted hover:bg-gray-100"
      >
        {/* bell-outline */}
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
      <NoticeContainer store={props.store} />
    </div>
  )
}
