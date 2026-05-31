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
  CubeSpinner,
  Snackbar,
  SnackMessage,
  useTranslation,
  MenuType
} from "@xbuilder/bunadmin"
import { SnackbarProvider } from "notistack"
import {
  getDynamicIndex,
  getPluginsDataJson,
  getPluginsDataTs,
  requirePlugin
} from "./pluginRegistry"
import { YOUR_DB } from "./utils/database"

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
    if (asPath === DynamicRoute || asPath === DynamicDocRoute) return
    ;(async () => {
      const authPluginName =
        process.env.VITE_AUTH_PLUGIN || DEFAULT_AUTH_PLUGIN
      const authPlugin = getDynamicIndex()[authPluginName] as IAuthPlugin
      if (!authPlugin) throw new Error("auth plugin is required")

      let pluginsData: PluginData[] = getPluginsDataJson()
      const extra = getPluginsDataTs()
      if (extra && extra.length) pluginsData = [...pluginsData, ...extra]

      const initDataRes = await initData({
        i18n,
        authPlugin,
        setIsProtected,
        pluginsData,
        requirePlugin,
        initialized,
        setInitialized,
        dbOverride: YOUR_DB
      })

      if (initDataRes) {
        setLeftMenuData(initDataRes.menuData)
        setReady(true)
      }
    })()
  }, [asPath, i18n, initialized])

  if (!ready) return <CubeSpinner />

  return (
    <Provider store={store}>
      <SnackbarProvider
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
              Component={() => (
                <GroupName
                  leftMenuData={leftMenuData}
                  isProtected={isProtected}
                />
              )}
            />
            <Route
              path={"/:group/:name"}
              Component={() => (
                <GroupName
                  leftMenuData={leftMenuData}
                  isProtected={isProtected}
                />
              )}
            />
            <Route path="*" Component={HTTP404} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  )
}

export default App
