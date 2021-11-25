import React, { Suspense, lazy, useState, useEffect } from "react"
import { Route, Switch } from "react-router-dom"
import { Router } from "react-router"
import { Provider } from "react-redux"
import {
  DEFAULT_AUTH_PLUGIN,
  defaultTheme,
  DynamicDocRoute,
  DynamicRoute,
  IAuthPlugin,
  initData,
  PluginData,
  store,
  UserRoute,
  CubeSpinner,
  Snackbar,
  SnackMessage,
  useTranslation,
  MenuType
} from "@bunred/bunadmin"
import { CssBaseline, ThemeProvider } from "@material-ui/core"
import { SnackbarProvider } from "notistack"
import { createBrowserHistory } from "history"

const HTTP404 = lazy(() => import("./pages/404"))
const GroupName = lazy(() => import("./pages/[group]-[name]"))

const history = createBrowserHistory()

const App = () => {
  const asPath = window.location.pathname
  const { i18n } = useTranslation()
  const [ready, setReady] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [isProtected, setIsProtected] = useState(false)
  const [leftMenuData, setLeftMenuData] = useState<MenuType[]>([])

  function requirePlugin(path: string) {
    try {
      return require(`./.bunadmin/dynamic/${path}`)
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    ; (async () => {
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
      ; (async () => {
        const authPluginName =
          process.env.REACT_APP_AUTH_PLUGIN || DEFAULT_AUTH_PLUGIN
        const authPlugin: IAuthPlugin = await import(
          `./.bunadmin/dynamic/${authPluginName}`
        )
        let pluginsData: PluginData[] = require("./.bunadmin/dynamic/pluginsData.json")
        const plugins = require("./.bunadmin/dynamic/pluginsData")
        if (plugins && plugins.data)
          pluginsData = [...pluginsData, ...plugins.data]

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
  }, [asPath, i18n, initialized])

  if (!ready) return <CubeSpinner />

  return (
    <Provider store={store}>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <SnackbarProvider
          anchorOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          autoHideDuration={2000}
          content={(key, message) => (
            <SnackMessage id={key} message={message} />
          )}
        >
          <Snackbar />
        </SnackbarProvider>
        <Router history={history}>
          <Suspense fallback={<CubeSpinner />}>
            <Switch>
              <Route
                path={["/:group/:name", "/"]}
                component={() => <GroupName leftMenuData={leftMenuData} isProtected={isProtected} />}
              />
              <Route path="*" component={HTTP404} />
            </Switch>
          </Suspense>
        </Router>
      </ThemeProvider>
    </Provider>
  )
}

export default App
