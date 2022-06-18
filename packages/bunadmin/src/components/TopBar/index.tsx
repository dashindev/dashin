import AppBar, { AppBarProps } from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import IconButton from "@material-ui/core/IconButton"
import EvaIcon from "react-eva-icons"
import React, { useState, useEffect } from "react"
import { useTheme } from "@material-ui/core/styles"
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
import { Button } from "@material-ui/core"

const useStyles = topBarStyles

type TopBarProps = {
  menuClick: () => void
  docsHome?: string
  removeLeft?: boolean
  appBarPros?: AppBarProps
} & NoticePlugin

export default function TopBar(props: TopBarProps) {
  const { menuClick, removeLeft, appBarPros } = props
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
                size="small"
              >
                <EvaIcon
                  name="menu-2-outline"
                  size="large"
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
          </div>
        )}

        <div className={classes.rightBlock}>
          {!isDoc && (
            <>
              <NoticeMenu
                notificationCount={props.notificationCount}
                NotificationTable={props.NotificationTable}
              />
              <UserMenu />
              {ENV.ON_SETTING && <SettingMenu />}
            </>
          )}
          {ENV.ON_I18N && <I18nMenu />}
          {ENV.ON_DOC && <DocMenu isDoc={isDoc} docsHome={docsHome} />}
        </div>
      </Toolbar>
    </AppBar>
  )
}
