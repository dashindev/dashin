import React, { useEffect, useState } from "react"
import { Provider } from "react-redux"
import { useTranslation } from "react-i18next"
import { AppProps } from "next/app"
import Head from "next/head"
import { SnackbarProvider } from "notistack"
import {
  useRouter,
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
  MenuType
} from "@dashin-dev/dashin"
import "@dashin-dev/dashin/lib/utils/i18n"
import "../public/index.css"
import { YOUR_DB } from "../utils/database"

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
    /**
     * Waiting for dynamic route
     */
    if (asPath === DynamicRoute || asPath === DynamicDocRoute) return
    ;(async () => {
      const authPluginName =
        process.env.NEXT_PUBLIC_AUTH_PLUGIN || DEFAULT_AUTH_PLUGIN
      const authPlugin: IAuthPlugin = await import(
        `../.dashin/dynamic/${authPluginName}`
      )
      let pluginsData: PluginData[] = require("../.dashin/dynamic/pluginsData.json")
      const plugins = require("../.dashin/dynamic/pluginsData")
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
        setInitialized,
        dbOverride: YOUR_DB
      })

      if (initDataRes) {
        setLeftMenuData(initDataRes.menuData)
        setReady(true)
      }
    })()
  }, [asPath])

  if (!ready) return <CubeSpinner />

  return <>
    <Head>
      <title>Dashboard</title>
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width"
      />
    </Head>
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
      <Component
        leftMenuData={leftMenuData}
        isProtected={isProtected}
        {...pageProps}
      />
    </Provider>
  </>
}

export default App
