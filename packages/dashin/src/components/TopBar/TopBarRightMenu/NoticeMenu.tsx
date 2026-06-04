import React, { useEffect, useState } from "react"
import { Bell } from "lucide-react"
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
        className="relative inline-flex items-center justify-center rounded-full h-9 w-9 text-icon-muted hover:bg-primary/10 hover:text-primary"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute top-0 right-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-gradient px-1 text-[10px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </button>
      <NoticeContainer store={props.store} />
    </div>
  )
}
