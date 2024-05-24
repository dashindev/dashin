import React, { ReactElement, useEffect, useState } from "react"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import MenuItem from "@mui/material/MenuItem"
import Menu from "@mui/material/Menu"
import EvaIcon from "react-eva-icons"
import { useTheme } from "@mui/material/styles"
import Divider from "@mui/material/Divider"
import { DynamicRoute, LocalDataRoute, UserRoute } from "@/utils/routes"
import { useRouter } from "@/router"
import { Primary } from "@/core/auth/schema"
import { Trans, useTranslation } from "react-i18next"
import { BA_DB } from "@/utils/database"
import { SETTING_NAMES } from "@/utils"
import { useLayoutReducer } from "@/slices/layoutSlice"

interface State {
  username: string | "Guest"
}

export type UserMenuProps = {
  disableSwitch?: boolean // disable `switch account`
  prepend?: React.ReactNode
  append?: React.ReactNode
  LoginOverride?: () => ReactElement
  onLogin?: () => void
  onProfile?: () => void
  onLogout?: {
    func?: () => void
    funcOverride?: boolean
    // do action after `logout`; default or undefined is `redirect`
    actionAfter?: "reload" | "none" | "redirect"
    redirectTo?: string // redirect URL, default is `auth/sign-in`
  }
}

export default function UserMenu(props: UserMenuProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const {
    user: { username },
    isSignedIn,
    signIn,
    signOut
  } = useLayoutReducer()

  useEffect(() => {
    ;(async () => {
      const user = await BA_DB.settings
        .where("name")
        .equals(Primary)
        .first()
      if (user && user.value) {
        signIn({ username: user.value })
      }
    })()
  }, [])

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = ({ route }: { route?: string }) => {
    setAnchorEl(null)
    if (!route) return
    router.push(DynamicRoute, route)
  }

  const onLogin = () => {
    if (props.onLogin) {
      props.onLogin()
    } else {
      router.push(DynamicRoute, UserRoute.signIn)
    }
  }

  const onProfile = () => {
    props.onProfile?.()
  }

  const onLogout = async () => {
    if (props.onLogout) {
      props.onLogout.func?.()
      if (props.onLogout.funcOverride) return
    }

    // Sign out
    signOut()

    // renew user profile

    const db = BA_DB
    // delete auth
    await db.users.delete(username)
    // update username in setting
    await db.settings.put({
      name: Primary,
      value: undefined,
      updated_at: Date.now()
    })
    // update role in setting
    await db.settings.put({
      name: SETTING_NAMES.role,
      value: undefined,
      updated_at: Date.now()
    })

    handleClose({})
    if (!props.onLogout?.actionAfter || props.onLogout?.actionAfter == "none")
      return

    if (props.onLogout?.actionAfter == "reload") {
      window.location.reload()
    } else {
      router.push(
        props.onLogout?.redirectTo
          ? props.onLogout.redirectTo
          : UserRoute.signIn
      )
    }
  }

  return (
    // User Icon
    <div key={`isSignedIn_${isSignedIn}`}>
      {isSignedIn == false ? (
        props.LoginOverride ? (
          <props.LoginOverride />
        ) : (
          <Button
            color="primary"
            variant="outlined"
            size="small"
            onClick={onLogin}
            style={{ marginLeft: 12 }}
          >
            Sign in
          </Button>
        )
      ) : (
        <IconButton
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
          size="large">
          <EvaIcon
            name="shield-outline"
            size="medium"
            fill={theme.bunadmin.iconColor}
          />
        </IconButton>
      )}

      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        open={open}
        onClose={() => handleClose({})}
      >
        <MenuItem disabled>
          <Trans
            i18nKey="Signed as $username"
            values={{
              name: username && username.substr(0, 20)
            }}
          />
        </MenuItem>
        {props.prepend}
        <MenuItem onClick={onProfile}>{t("Profile")}</MenuItem>
        <Divider />
        {/* Switch user is not disabled */}
        {!props.disableSwitch && (
          <MenuItem onClick={() => handleClose({ route: LocalDataRoute.auth })}>
            {t("Switch account")}
          </MenuItem>
        )}
        {!props.disableSwitch && (
          <MenuItem onClick={onLogin}>{t("Add another account")}</MenuItem>
        )}
        {!props.disableSwitch && <Divider />}

        {props.append}
        <MenuItem onClick={onLogout}>{t("Logout")}</MenuItem>
      </Menu>
    </div>
  );
}
