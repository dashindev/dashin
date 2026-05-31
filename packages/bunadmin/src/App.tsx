import React, { Suspense, lazy, useState, useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import {
  DEFAULT_AUTH_PLUGIN,
  DynamicDocRoute,
  DynamicRoute,
  IAuthPlugin,
  initData,
  PluginData,
  store,
  UserRoute
} from "./utils"
import { SnackbarProvider } from "notistack"
import { CubeSpinner, Snackbar, SnackMessage } from "./components"
import { useTranslation } from "react-i18next"
import { MenuType } from "@/core"
import {
  getDynamicIndex,
  getPluginsDataJson,
  getPluginsDataTs,
  requirePlugin
} from "@/utils/pluginRegistry"

const HTTP404 = lazy(() => import("./pages/404"))
const GroupName = lazy(() => import("./pages/[group]-[name]"))

const App = () => {
  const asPath = window.location.pathname
  const { i18n } = useTranslation()
  const [ready, setReady] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [isProtected, setIsProtected] = useState(false)
  const [leftMenuData, setLeftMenuData] = useState<MenuType[]>([])

  useEffect(() => {
    ;(async () => {
      const jssStyles = document.querySelector("#jss-server-side")
      if (jssStyles) {
        // @ts-ignore
        jssStyles.parentElement.removeChild(jssStyles)
      }
    })()
  }, [])

  useEffect(() => {
    /**
     * Waiting for dynamic route
     */
    if (asPath === DynamicRoute || asPath === DynamicDocRoute) return
    ;(async () => {
      const authPluginName =
        process.env.VITE_AUTH_PLUGIN || DEFAULT_AUTH_PLUGIN
      if (!authPluginName || authPluginName == "")
        throw new Error("auth plugin name is required, please set in .env file")

      const authPlugin = getDynamicIndex()[authPluginName] as
        | IAuthPlugin
        | undefined
      if (!authPlugin) throw new Error("auth plugin is required")

      let pluginsData: PluginData[] = getPluginsDataJson()
      const extra = getPluginsDataTs()
      if (extra && extra.length) pluginsData = [...pluginsData, ...extra]

      /**
       * Initialization data
       */
      const initDataRes = await initData({
        i18n,
        authPlugin,
        setIsProtected,
        pluginsData,
        requirePlugin,
        initialized,
        setInitialized
      })

      if (initDataRes) {
        setLeftMenuData(initDataRes.menuData)
        setReady(true)
      }
    })()
  }, [asPath])

  useEffect(() => {
    if (!isProtected) return

    const path = window.location.pathname
    if (path.indexOf(UserRoute.signIn) >= 0) return

    let toUrl = `${UserRoute.signIn}?redirect=${asPath}`
    toUrl = toUrl.replace(`?redirect=${UserRoute.signIn}`, "")
    toUrl = toUrl.replace(`?redirect=${DynamicRoute}`, "/")
    toUrl = toUrl.replace(`?redirect=${DynamicDocRoute}`, "/")
    window.location.replace(toUrl)
  }, [isProtected])

  if (!ready) return <CubeSpinner />

  return (
    <Provider store={store}>
      <SnackbarProvider
        anchorOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        autoHideDuration={2000}
        content={(key, message) => (
          <SnackMessage store={store} id={key} message={message} />
        )}
      >
        <Snackbar />
      </SnackbarProvider>
      <BrowserRouter>
        <Suspense fallback={<CubeSpinner />}>
          <Routes>
            <Route
              path={"/"}
              Component={() => <GroupName leftMenuData={leftMenuData} />}
            />
            <Route
              path={"/:group/:name"}
              Component={() => <GroupName leftMenuData={leftMenuData} />}
            />
            <Route path="*" Component={HTTP404} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  )
}

export default App
