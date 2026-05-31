import React, { ReactElement, useEffect } from "react"
import { Menu } from "@headlessui/react"
import { DynamicRoute, LocalDataRoute, UserRoute } from "@/utils/routes"
import { useRouter } from "@/router"
import { Primary } from "@/core/auth/schema"
import { Trans, useTranslation } from "react-i18next"
import { BA_DB } from "@/utils/database"
import { SETTING_NAMES } from "@/utils"
import { useLayoutReducer } from "@/slices/layoutSlice"

export type UserMenuProps = {
  disableSwitch?: boolean
  prepend?: React.ReactNode
  append?: React.ReactNode
  LoginOverride?: () => ReactElement
  onLogin?: () => void
  onProfile?: () => void
  onLogout?: {
    func?: () => void
    funcOverride?: boolean
    actionAfter?: "reload" | "none" | "redirect"
    redirectTo?: string
  }
}

export default function UserMenu(props: UserMenuProps) {
  const { t } = useTranslation()
  const router = useRouter()
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

  const handleRoute = (route?: string) => {
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

    signOut()

    const db = BA_DB
    await db.users.delete(username)
    await db.settings.put({
      name: Primary,
      value: undefined,
      updated_at: Date.now()
    })
    await db.settings.put({
      name: SETTING_NAMES.role,
      value: undefined,
      updated_at: Date.now()
    })

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
    <div key={`isSignedIn_${isSignedIn}`}>
      {isSignedIn == false ? (
        props.LoginOverride ? (
          <props.LoginOverride />
        ) : (
          <button
            className="ml-3 rounded border border-primary px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10"
            onClick={onLogin}
          >
            Sign in
          </button>
        )
      ) : (
        <Menu as="div" className="relative">
          <Menu.Button className="inline-flex items-center justify-center rounded p-2 text-icon-muted hover:bg-primary/10">
            {/* shield-outline */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
          </Menu.Button>
          <Menu.Items className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded bg-content-box py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
            <Menu.Item disabled>
              {({ active }) => (
                <div className="px-4 py-2 text-sm text-icon-muted">
                  <Trans
                    i18nKey="Signed as $username"
                    values={{
                      name: username && username.substr(0, 20)
                    }}
                  />
                </div>
              )}
            </Menu.Item>
            {props.prepend}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onProfile}
                  className={`${active ? "bg-content-bg" : ""} w-full px-4 py-2 text-left text-sm`}
                >
                  {t("Profile")}
                </button>
              )}
            </Menu.Item>
            <div className="my-1 border-t border-bn-border" />
            {!props.disableSwitch && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleRoute(LocalDataRoute.auth)}
                    className={`${active ? "bg-content-bg" : ""} w-full px-4 py-2 text-left text-sm`}
                  >
                    {t("Switch account")}
                  </button>
                )}
              </Menu.Item>
            )}
            {!props.disableSwitch && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onLogin}
                    className={`${active ? "bg-content-bg" : ""} w-full px-4 py-2 text-left text-sm`}
                  >
                    {t("Add another account")}
                  </button>
                )}
              </Menu.Item>
            )}
            {!props.disableSwitch && (
              <div className="my-1 border-t border-bn-border" />
            )}
            {props.append}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`${active ? "bg-content-bg" : ""} w-full px-4 py-2 text-left text-sm`}
                >
                  {t("Logout")}
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )}
    </div>
  )
}
