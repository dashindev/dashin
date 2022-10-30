import React, { useEffect, useState } from "react"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import MenuItem from "@material-ui/core/MenuItem"
import Menu from "@material-ui/core/Menu"
import EvaIcon from "react-eva-icons"
import { useTheme } from "@material-ui/core/styles"
import Divider from "@material-ui/core/Divider"
import { DynamicRoute, LocalDataRoute, UserRoute } from "@/utils/routes"
import { useRouter } from "@/router"
import { Primary } from "@/core/auth/schema"
import { Trans, useTranslation } from "react-i18next"
import { BA_DB } from "@/utils/database"

interface State {
  username: string | "Guest"
}

export type UserMenuProps = {
  onProfile?: () => void
  onLogout?: {
    func: () => void
    override?: boolean
  }
}

export default function UserMenu(props: UserMenuProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [state, setState] = useState<State>({
    username: ""
  })

  useEffect(() => {
    ;(async () => {
      const user = await BA_DB.settings
        .where("name")
        .equals(Primary)
        .first()
      if (user && user.value) {
        setState({
          ...state,
          username: user.value
        })
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

  const onProfile = () => {
    props.onProfile?.()
  }

  const onLogout = async () => {
    if (props.onLogout) {
      props.onLogout.func()
      if (props.onLogout.override) return
    }

    // update username in setting
    await BA_DB.settings.put({
      name: Primary,
      value: undefined,
      updated_at: Date.now()
    })

    handleClose({})
    router.push(UserRoute.signIn)
  }

  return (
    // User Icon
    <div>
      {state.username == "" ? (
        <Button
          color="primary"
          variant="outlined"
          size="small"
          onClick={() => {
            router.push(DynamicRoute, UserRoute.signIn)
          }}
          style={{ marginLeft: 12 }}
        >
          Sign in
        </Button>
      ) : (
        <IconButton
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
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
              name: state.username && state.username.substr(0, 20)
            }}
          />
        </MenuItem>
        <MenuItem onClick={onProfile}>{t("Profile")}</MenuItem>
        <Divider />
        <MenuItem onClick={() => handleClose({ route: LocalDataRoute.auth })}>
          {t("Switch account")}
        </MenuItem>
        <MenuItem onClick={() => handleClose({ route: UserRoute.signIn })}>
          {t("Add another account")}
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogout}>{t("Logout")}</MenuItem>
      </Menu>
    </div>
  )
}
