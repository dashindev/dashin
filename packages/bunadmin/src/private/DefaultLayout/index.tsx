import React, { useEffect, useState } from "react"
import LeftMenu from "../../components/LeftMenu"
import TopBar from "../../components/TopBar"
import StatBand from "../../components/regions/StatBand"
import SidebarFooter from "../../components/regions/SidebarFooter"
import { DefaultLayoutProps } from "@/components"
import { getLayout } from "@/utils/themes/layouts"
import { ENV, store } from "@/utils"
import { importPlugin, hasPlugin } from "@/utils/pluginRegistry"

/**
 * !DO NOT export DefaultLayout in @dashin-dev/dashin
 * Due to the dynamic import of aliases (@plugin) and customized elements
 * DefaultLayout needs to be defined in each project.
 * @param props
 * @constructor
 */
export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children, leftMenu, stats, sidebarStats, sidebarUpgrade } = props
  const cfg = getLayout(props.layout?.id)
  const layout = { ...cfg, ...props.layout }
  const [open, setOpen] = React.useState(true)
  const [phoneVertical, setPhoneVertical] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width:640px)")
    setPhoneVertical(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPhoneVertical(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const [NotifyTable, setNotifyTable] = useState<JSX.Element>()
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
        NotificationTable={NotifyTable}
      />
      <div className="flex">
        <nav aria-label="left menus">
          <aside
            className={`relative whitespace-nowrap overflow-x-hidden transition-[width] duration-300 ease-in-out border-r-0 bg-sidebar flex flex-col ${
              open ? "w-[240px]" : "w-[57px] sm:w-[73px]"
            }`}
            style={{ height: "calc(100vh - 64px)" }}
          >
            <LeftMenu
              {...leftMenu}
              append={
                open && layout.sidebarFooter !== "none" ? (
                  <div className="mt-auto">
                    <SidebarFooter
                      variant={layout.sidebarFooter}
                      upgrade={sidebarUpgrade}
                      stats={sidebarStats}
                    />
                  </div>
                ) : (
                  leftMenu?.append
                )
              }
            />
          </aside>
        </nav>
        <div
          className="flex-grow p-[36px] bg-content-bg rounded-tl-bn overflow-auto"
          style={{
            height: "calc(100vh - 64px)",
            maxWidth: phoneVertical
              ? "auto"
              : open
              ? "calc(100vw - 240px)"
              : "calc(100vw - 73px)"
          }}
        >
          {layout.statBand && stats && <StatBand stats={stats} />}
          <div className="bg-content-box overflow-hidden rounded-bn h-full shadow">
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
