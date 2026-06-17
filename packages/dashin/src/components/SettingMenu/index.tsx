import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import EvaIcon from "../EvaIcon"
import { settingMenus } from "@/utils/config/settingMenus"
import { useRouter } from "@/router"
import { DynamicRoute } from "@/utils/routes"
import { useTranslation } from "react-i18next"

interface Props {
  collapsed?: boolean
}

export default function SettingMenu({ collapsed }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const { group: qGroup, name: qName } = router.query
  const [open, setOpen] = React.useState(true)

  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 })
  const closeTimer = useRef(0)

  const showFlyout = (el: HTMLElement) => {
    window.clearTimeout(closeTimer.current)
    const rect = el.getBoundingClientRect()
    setFlyoutPos({ top: rect.top, left: rect.right })
    setFlyoutOpen(true)
  }
  const delayHideFlyout = () => {
    closeTimer.current = window.setTimeout(() => setFlyoutOpen(false), 150)
  }
  const keepFlyout = () => window.clearTimeout(closeTimer.current)
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  const handleClick = () => {
    setOpen(!open)
  }

  const handleRoute = ({ route }: { route: string }) => {
    router.push(DynamicRoute, route)
  }

  const items = settingMenus()

  return (
    <ul className="w-full max-w-[360px] bg-sidebar list-none p-0">
      <li
        className={`flex items-center ${
          collapsed ? "justify-center mx-1 px-2" : "mx-2 px-3"
        } py-2 cursor-pointer rounded-bn text-foreground hover:bg-primary/10`}
        onClick={!collapsed ? handleClick : undefined}
        onMouseEnter={collapsed ? e => showFlyout(e.currentTarget) : undefined}
        onMouseLeave={collapsed ? delayHideFlyout : undefined}
      >
        <span className={`${collapsed ? "" : "mr-3"} flex items-center`}>
          <EvaIcon name="settings-outline" size="medium" fill="currentColor" />
        </span>
        {!collapsed && <span className="flex-1 text-sm">{t("Setting")}</span>}
        {!collapsed && (
          <span className="text-icon-muted">
            {open ? (
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
            ) : (
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
            )}
          </span>
        )}
      </li>
      {!collapsed && open && (
        <ul className="list-none p-0">
          {items.map((item, index) => (
            <li
              key={index}
              className={`flex items-center mx-2 pl-9 pr-3 py-2 cursor-pointer rounded-bn transition-[padding-left] duration-500 ease-in-out hover:bg-primary/10 ${item.route === `/${qGroup}/${qName}` ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
              onClick={() => handleRoute({ route: item.route })}
            >
              {item.icon && <span className="mr-3 flex items-center">{item.icon}</span>}
              <span className="text-sm">{t(item.name)}</span>
            </li>
          ))}
        </ul>
      )}

      {collapsed && flyoutOpen && createPortal(
        <div
          className="fixed bg-sidebar border border-bn-border rounded-r-bn shadow-xl py-1 z-[1400] min-w-[180px]"
          style={{ left: flyoutPos.left, top: flyoutPos.top }}
          onMouseEnter={keepFlyout}
          onMouseLeave={() => setFlyoutOpen(false)}
        >
          <div className="px-3 py-1.5 text-xs font-semibold text-icon-muted uppercase tracking-wide">
            {t("Setting")}
          </div>
          {items.map((item, index) => {
            const isSelected = item.route === `/${qGroup}/${qName}`
            return (
              <div
                key={index}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 ${
                  isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                }`}
                onClick={() => { handleRoute({ route: item.route }); setFlyoutOpen(false) }}
              >
                {t(item.name)}
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </ul>
  )
}
