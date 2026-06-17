import React, { useEffect, useState } from "react"
import LeftMenu from "../../components/LeftMenu"
import TopBar from "../../components/TopBar"
import StatBand, { Stat } from "../../components/regions/StatBand"
import { StatsContext } from "../../components/Table/statsContext"
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
/** Placeholder cards shown while the table computes its stats. */
function StatBandSkeleton() {
  return (
    <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-content-box border border-bn-border rounded-bn p-4 shadow-bn animate-pulse"
        >
          <div className="h-3 w-20 rounded bg-bn-border" />
          <div className="mt-3 h-6 w-12 rounded bg-bn-border" />
          <div className="mt-4 h-2 w-full rounded-full bg-bn-border" />
        </div>
      ))}
    </div>
  )
}

export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children, leftMenu, stats, sidebarStats, sidebarUpgrade } = props
  const cfg = getLayout(props.layout?.id)
  const layout = { ...cfg, ...props.layout }
  const [open, setOpen] = React.useState(true)
  const [phoneVertical, setPhoneVertical] = useState(false)
  // Live stats pushed up from the <Table> (fallback to the `stats` prop).
  const [liveStats, setLiveStats] = useState<Stat[] | null>(null)
  const bandStats = liveStats ?? stats

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
          <StatsContext.Provider value={{ setStats: setLiveStats }}>
            {layout.statBand &&
              (bandStats && bandStats.length ? (
                <StatBand stats={bandStats} />
              ) : (
                liveStats === null && <StatBandSkeleton />
              ))}
            {layout.contentCard === false ? (
              children
            ) : (
              <div className="bg-content-box overflow-auto rounded-bn shadow" style={{ maxHeight: "calc(100vh - 64px - 72px)" }}>
                {children}
              </div>
            )}
          </StatsContext.Provider>
        </div>
      </div>
    </div>
  )

  function handleDrawerToggle() {
    setOpen(!open)
  }
}
