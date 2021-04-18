import React, { useEffect, useState } from "react"
import { Provider } from "react-redux"
import { useTranslation } from "react-i18next"
import { AppProps } from "next/app"
import Head from "next/head"
import { ThemeProvider, CssBaseline } from "@material-ui/core"
import { SnackbarProvider } from "notistack"
import {
  useRouter,
  defaultTheme,
  initData,
  store,
  Snackbar,
  SnackMessage,
  CubeSpinner,
  DynamicDocRoute,
  DynamicRoute,
  IAuthPlugin,
  DEFAULT_AUTH_PLUGIN,
  PluginData,
  UserRoute,
  MenuType
} from "@bunred/bunadmin"
import "@bunred/bunadmin/lib/utils/i18n"
import "../public/index.css"

const App = ({ Component, pageProps }: AppProps) => {
  const { i18n } = useTranslation()
  const router = useRouter()
  const { asPath } = router
  const [ready, setReady] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [isProtected, setIsProtected] = useState(false)
  const [leftMenuData, setLeftMenuData] = useState<MenuType[]>([])

  function requirePlugin(path: string) {
    try {
      return require(`../plugins/${path}`)
    } catch (err) {
      return null
    }
  }

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
        process.env.NEXT_PUBLIC_AUTH_PLUGIN || DEFAULT_AUTH_PLUGIN
      const authPlugin: IAuthPlugin = await import(
        `../.bunadmin/dynamic/${authPluginName}`
      )
      let pluginsData: PluginData[] = require("../.bunadmin/dynamic/pluginsData.json")
      const plugins = require("../.bunadmin/dynamic/pluginsData")
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
  }, [isProtected, asPath])

  if (!ready) return <CubeSpinner />

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
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
          <Component leftMenuData={leftMenuData} {...pageProps} />
        </ThemeProvider>
      </Provider>
    </>
  )
}

export default App
