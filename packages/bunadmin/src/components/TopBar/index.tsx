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

export const HEADER_HEIGHT: number = 46

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
        className="flex items-center justify-between pl-5"
        style={{ minHeight: HEADER_HEIGHT }}
      >
        {!removeLeft && (
          <div className="flex items-center">
            {!isDoc && (
              <button
                aria-label="open drawer"
                onClick={menuClick}
                className="inline-flex items-center justify-center rounded p-2 text-icon-muted hover:bg-primary/10"
              >
                {/* menu-2-outline icon */}
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
              </button>
            )}
            {logo ? (
              logo
            ) : (
              <button
                id="header_logo"
                className="px-2 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded"
                onClick={() => {
                  router.push(!isDoc ? "/" : docsHome)
                }}
              >
                {!isDoc ? ENV.SITE_NAME : ENV.SITE_NAME + " DOCS"}
              </button>
            )}

            {appendLeft}
          </div>
        )}

        <div className="flex items-center">
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
