import React, { useEffect, useState } from "react"
import {
  TopBar,
  LeftMenu,
  DefaultLayoutProps,
  ENV,
  store
} from "@dashin-dev/dashin"
import { importPlugin, hasPlugin } from "../../pluginRegistry"

export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children, leftMenu } = props
  const [open, setOpen] = React.useState(true)
  const [phoneVertical, setPhoneVertical] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width:640px)")
    setPhoneVertical(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPhoneVertical(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const [notifyTable, setNotifyTable] = useState<JSX.Element>()
  const [notifyCount, setNotifyCount] = useState<() => Promise<number>>()

  useEffect(() => {
    ;(async () => {
      if (!ENV.NOTIFICATION_PLUGIN) return
      const p = ENV.NOTIFICATION_PLUGIN
      if (!hasPlugin(p)) return
      const { NotificationTable, notificationCount } = await importPlugin(p)
      if (!NotificationTable || !notificationCount) return
      setNotifyTable(NotificationTable)
      setNotifyCount(notificationCount)
    })()
  }, [])

  return (
    <div className="h-screen bg-white">
      <TopBar
        store={store}
        menuClick={handleDrawerToggle}
        notificationCount={notifyCount}
        NotificationTable={notifyTable}
      />
      <div className="flex">
        <nav aria-label="left menus">
          <aside
            className={`relative whitespace-nowrap overflow-x-hidden transition-[width] duration-300 ease-in-out border-r-0 ${
              open ? "w-[240px]" : "w-[57px] sm:w-[73px]"
            }`}
          >
            <LeftMenu {...leftMenu} />
          </aside>
        </nav>
        <div
          className="flex-grow p-[36px] bg-[#EDF1F7] rounded-tl-[10px]"
          style={{
            height: "calc(100vh - 46px)",
            maxWidth: phoneVertical
              ? "auto"
              : open
              ? "calc(100vw - 240px)"
              : "calc(100vw - 73px)"
          }}
        >
          <div className="bg-white overflow-hidden rounded-[10px] h-full shadow">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  function handleDrawerToggle() {
    setOpen(!open)
  }
}
