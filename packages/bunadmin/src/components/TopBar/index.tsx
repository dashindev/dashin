import AppBar, { AppBarProps } from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import EvaIcon from "react-eva-icons"
import React from "react"
import { EnhancedStore, AnyAction } from "@reduxjs/toolkit"
import { ThunkMiddlewareFor } from "@reduxjs/toolkit/src/getDefaultMiddleware"
import { useTheme } from "@mui/material/styles"
import { topBarStyles } from "./styles"
import UserMenu from "./TopBarRightMenu/UserMenu"
import SettingMenu from "./TopBarRightMenu/SettingMenu"
import NoticeMenu from "./TopBarRightMenu/NoticeMenu"
import I18nMenu from "@/components/TopBar/TopBarRightMenu/I18nMenu"
import { ENV } from "@/utils/config"
import DocMenu from "./TopBarRightMenu/DocMenu"
import { useRouter } from "@/router"
import { DynamicDocRoute } from "@/utils/routes"
import { NoticePlugin } from "@/utils"
import { Button } from "@mui/material"
import { UserMenuProps } from "./TopBarRightMenu/UserMenu"

const useStyles = topBarStyles

type TopBarProps = {
  store: EnhancedStore<any, AnyAction, [ThunkMiddlewareFor<any>]>
  menuClick: () => void
  docsHome?: string
  removeLeft?: boolean
  appBarPros?: AppBarProps
  appendLeft?: React.ReactNode
  prependRight?: React.ReactNode
  appendRight?: React.ReactNode
  userMenuProps?: UserMenuProps
} & NoticePlugin

export default function TopBar(props: TopBarProps) {
  const {
    menuClick,
    removeLeft,
    appendLeft,
    prependRight,
    appendRight,
    appBarPros
  } = props
  const classes = useStyles()
  const theme = useTheme()
  const router = useRouter()
  const isDoc = router.route === DynamicDocRoute
  const docsHome = props.docsHome || "/docs/getting-started/introduction"

  return (
    <AppBar
      elevation={0}
      color="inherit"
      position="relative"
      className={classes.appBar}
      {...appBarPros}
    >
      <Toolbar
        className={classes.toolbar}
        classes={{ gutters: classes.gutters }}
      >
        {!removeLeft && (
          <div className={classes.leftBlock}>
            {!isDoc && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={menuClick}
                className={classes.menuButton}
              >
                <EvaIcon
                  name="menu-2-outline"
                  size="medium"
                  fill={theme.bunadmin.iconColor}
                />
              </IconButton>
            )}
            <Button
              variant={"text"}
              size="medium"
              color="primary"
              onClick={() => {
                router.push(!isDoc ? "/" : docsHome)
              }}
            >
              {!isDoc ? ENV.SITE_NAME : ENV.SITE_NAME + " DOCS"}
            </Button>
            {appendLeft}
          </div>
        )}

        <div className={classes.rightBlock}>
          {prependRight}
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
      </Toolbar>
    </AppBar>
  )
}
