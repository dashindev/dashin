import React from "react"
import { EnhancedStore, AnyAction } from "@reduxjs/toolkit"
import { ThunkMiddlewareFor } from "@reduxjs/toolkit/src/getDefaultMiddleware"
import UserMenu from "./TopBarRightMenu/UserMenu"
import SettingMenu from "./TopBarRightMenu/SettingMenu"
import NoticeMenu from "./TopBarRightMenu/NoticeMenu"
import I18nMenu from "@/components/TopBar/TopBarRightMenu/I18nMenu"
import { ENV } from "@/utils/config"
import DocMenu from "./TopBarRightMenu/DocMenu"
import ThemeToggle from "./TopBarRightMenu/ThemeToggle"
import { useRouter } from "@/router"
import { DynamicDocRoute } from "@/utils/routes"
import { NoticePlugin } from "@/utils"
import { UserMenuProps } from "./TopBarRightMenu/UserMenu"

export const HEADER_HEIGHT: number = 64

type TopBarProps = {
  store: EnhancedStore<any, AnyAction, [ThunkMiddlewareFor<any>]>
  menuClick: () => void
  docsHome?: string
  removeLeft?: boolean
  logo?: React.ReactNode
  appendLeft?: React.ReactNode
  prependRight?: React.ReactNode
  appendRight?: React.ReactNode
  userMenuProps?: UserMenuProps
} & NoticePlugin

export default function TopBar(props: TopBarProps) {
  const {
    menuClick,
    removeLeft,
    logo,
    appendLeft,
    prependRight,
    appendRight
  } = props
  const router = useRouter()
  const isDoc = router.route === DynamicDocRoute
  const docsHome = props.docsHome || "/docs/getting-started/introduction"

  return (
    <div className="relative z-[1201] border-b border-bn-border bg-sidebar">
      <div
        className="flex items-center gap-4 px-4"
        style={{ minHeight: HEADER_HEIGHT }}
      >
        {!removeLeft && (
          <div className="flex items-center gap-2 shrink-0">
            {logo ? (
              logo
            ) : (
              <button
                id="header_logo"
                className="flex items-center gap-2 px-1 py-1 rounded-bn"
                onClick={() => {
                  router.push(!isDoc ? "/" : docsHome)
                }}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-bn bg-primary-gradient text-primary-foreground font-bold">
                  {(ENV.SITE_NAME || "B").charAt(0)}
                </span>
                <span className="text-base font-semibold text-foreground">
                  {!isDoc ? ENV.SITE_NAME : ENV.SITE_NAME + " DOCS"}
                </span>
              </button>
            )}
            {!isDoc && (
              <button
                aria-label="open drawer"
                onClick={menuClick}
                className="inline-flex items-center justify-center rounded-full h-9 w-9 text-icon-muted hover:bg-primary/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
              </button>
            )}
            {appendLeft}
          </div>
        )}

        {/* Centered search (mockup-3) */}
        {!isDoc && (
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-xl flex items-center gap-2 rounded-full border border-bn-border bg-content-bg px-4 py-2 text-sm text-icon-muted">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.7.7l.27.28v.79l5 5 1.49-1.5-5-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z"/></svg>
              <span className="flex-1">Search products, orders, customers...</span>
              <kbd className="text-xs text-icon-muted border border-bn-border rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {prependRight}
          <ThemeToggle />
          {ENV.ON_I18N && <I18nMenu />}
          {ENV.ON_DOC && <DocMenu isDoc={isDoc} docsHome={docsHome} />}
          {!isDoc && (
            <>
              <NoticeMenu
                store={props.store}
                notificationCount={props.notificationCount}
                NotificationTable={props.NotificationTable}
              />
              {ENV.ON_SETTING && <SettingMenu />}

              {appendRight}
              <UserMenu {...props.userMenuProps} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
