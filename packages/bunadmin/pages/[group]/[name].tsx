import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { CoreContainer, SchemaContainer, withoutLayout, ENV } from "../../src"
import PluginTable from "../../src/private/PluginTable"
import DefaultLayout from "../../src/private/DefaultLayout"
import Error from "../../src/private/Error"

const DynamicGroupNamePage = () => {
  const router = useRouter()
  const { group, name } = router.query as ParsedUrlQuery
  const [NtTable, setNtTable] = useState<JSX.Element>()
  const [NtCount, setNtCount] = useState<() => Promise<number>>()

  useEffect(() => {
    ;(async () => {
      if (!ENV.NOTIFICATION_PLUGIN) return
      const customNotificationPath = ENV.NOTIFICATION_PLUGIN
      const { NotificationTable, notificationCount } = await import(
        `../../.dashin/dynamic/${customNotificationPath}`
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
    default:
      render = <SchemaContainer PluginTable={PluginTable} Error={Error} />
  }

  if (withoutLayout(group, name)) return render

  return <DefaultLayout>{render}</DefaultLayout>
}

export default DynamicGroupNamePage
