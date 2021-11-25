import React, { useEffect, useState } from "react"
import { ParsedUrlQuery } from "querystring"
import {
  CoreContainer,
  SchemaContainer,
  withoutLayout,
  ENV,
  useRouter,
  MenuType
} from "@bunred/bunadmin"
import PluginTable from "../components/PluginTable"
import DefaultLayout from "../components/DefaultLayout"
import Error from "../components/Error"
import Index from "./index"
import { SignIn as AuthComponent } from "bunadmin-auth-buncms"

const DynamicGroupNamePage = ({
  leftMenuData,
  isProtected
}: {
  leftMenuData?: MenuType[],
  isProtected?: boolean
}) => {
  const router = useRouter()
  const { group, name } = router.query as ParsedUrlQuery
  const [NtTable, setNtTable] = useState<JSX.Element>()
  const [NtCount, setNtCount] = useState<() => Promise<number>>()

  useEffect(() => {
    ; (async () => {
      if (!ENV.NOTIFICATION_PLUGIN) return
      const customNotificationPath = ENV.NOTIFICATION_PLUGIN
      const { NotificationTable, notificationCount } = await import(
        `../.bunadmin/dynamic/${customNotificationPath}`
      )
      if (!NotificationTable || !notificationCount) return
      setNtTable(NotificationTable)
      setNtCount(notificationCount)
    })()
  }, [])

  let render
  switch (group) {
    case "core":
      render = (
        <CoreContainer
          NotificationTable={NtTable}
          notificationCount={NtCount}
        />
      )
      break
    case "auth":
      switch (name) {
        case "sign-in":
        case "sign-up":
        case "recovery":
          return (
            <SchemaContainer
              isAuthPath={true}
              PluginTable={PluginTable}
              Error={Error}
            />
          )
        default:
          render = <SchemaContainer PluginTable={PluginTable} Error={Error} />
      }
      break
    case undefined:
      render = <Index />
      break
    default:
      render = <SchemaContainer PluginTable={PluginTable} Error={Error} />
  }

  if (withoutLayout(group, name)) return render

  if (isProtected) return <AuthComponent />

  return (
    <DefaultLayout leftMenu={{ data: leftMenuData }}>{render}</DefaultLayout>
  )
}

export default DynamicGroupNamePage
