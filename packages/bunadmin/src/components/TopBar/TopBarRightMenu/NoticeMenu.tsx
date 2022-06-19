import React, { useEffect, useState } from "react"
import { EnhancedStore, AnyAction } from "@reduxjs/toolkit"
import { ThunkMiddlewareFor } from "@reduxjs/toolkit/src/getDefaultMiddleware"
import IconButton from "@material-ui/core/IconButton"
import EvaIcon from "react-eva-icons"
import { useTheme } from "@material-ui/core/styles"
import Badge from "@material-ui/core/Badge"
import { ENV, NoticePlugin } from "@/utils"
import NoticeContainer from "@/core/notice"
import { toggleNotifyDrawer } from "@/slices/noticeSlice"

type Props = {
  store: EnhancedStore<any, AnyAction, [ThunkMiddlewareFor<any>]>
} & NoticePlugin

export default function NoticeMenu(props: Props) {
  const theme = useTheme()

  const [intervalID, setIntervalID] = useState<NodeJS.Timeout>()
  const ref = React.useRef()
  const [count, setCount] = useState(0)

  const handleMenu = async (_event: React.MouseEvent<HTMLElement>) => {
    props.store.dispatch(toggleNotifyDrawer())
  }

  async function queryCount() {
    // Handle dynamic import `plugins`
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
      // Disabling interval counting is helpful for debugging or reducing server load
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

    // cache intervalID
    setIntervalID(id)
  }, [ref.current])

  return (
    // Notice Icon
    <div>
      <IconButton
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Badge badgeContent={count} color="primary">
          <EvaIcon
            name="bell-outline"
            size="medium"
            fill={theme.bunadmin.iconColor}
          />
        </Badge>
      </IconButton>
      <NoticeContainer />
    </div>
  )
}
