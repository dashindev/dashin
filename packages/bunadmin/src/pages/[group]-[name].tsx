import React from "react"
import { useRouter } from "@/router"
import { ParsedUrlQuery } from "querystring"
import {
  CoreContainer,
  SchemaContainer,
  withoutLayout,
  MenuType
} from "../../src"
import PluginTable from "../../src/private/PluginTable"
import DefaultLayout from "../../src/private/DefaultLayout"
import Error from "../../src/private/Error"
import Index from "./index"

const DynamicGroupNamePage = ({
  leftMenuData
}: {
  leftMenuData?: MenuType[]
}) => {
  const router = useRouter()
  const { group, name } = router.query as ParsedUrlQuery

  let render
  switch (group) {
    case "core":
      render = <CoreContainer />
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

  return (
    <DefaultLayout leftMenu={{ data: leftMenuData }}>{render}</DefaultLayout>
  )
}

export default DynamicGroupNamePage
