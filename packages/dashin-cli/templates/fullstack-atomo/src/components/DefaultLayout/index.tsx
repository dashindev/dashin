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
    <div className="h-screen bg-sidebar text-foreground">
      <TopBar
        store={store}
        menuClick={handleDrawerToggle}
        notificationCount={notifyCount}
        NotificationTable={notifyTable}
      />
      <div className="flex">
        <nav aria-label="left menus">
          <aside
            className={`relative whitespace-nowrap overflow-x-hidden overflow-y-auto transition-[width] duration-300 ease-in-out border-r-0 bg-sidebar flex flex-col ${
              open ? "w-[240px]" : "w-[57px] sm:w-[73px]"
            }`}
            style={{ height: "calc(100vh - 64px)" }}
          >
            <LeftMenu {...leftMenu} collapsed={!open} />
          </aside>
        </nav>
        <div
          className="min-w-0 flex-grow p-3 sm:p-[36px] bg-content-bg rounded-tl-bn overflow-y-auto overflow-x-hidden"
          style={{
            height: "calc(100vh - 64px)",
            maxWidth: phoneVertical
              ? "auto"
              : open
              ? "calc(100vw - 240px)"
              : "calc(100vw - 73px)"
          }}
        >
          <div className="bg-content-box overflow-x-auto rounded-bn shadow">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  function handleDrawerToggle() {
    setOpen(value => !value)
  }
}
