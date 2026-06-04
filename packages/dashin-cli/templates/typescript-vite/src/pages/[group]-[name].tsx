import React from "react"
import { ParsedUrlQuery } from "querystring"
import {
  CoreContainer,
  SchemaContainer,
  withoutLayout,
  useRouter,
  DEFAULT_AUTH_PLUGIN,
  MenuType
} from "@dashin-dev/dashin"
import PluginTable from "../components/PluginTable"
import DefaultLayout from "../components/DefaultLayout"
import Error from "../components/Error"
import Index from "./index"
import { getDynamicIndex } from "../pluginRegistry"

// Auth sign-in component is resolved from the configured auth plugin
// (VITE_AUTH_PLUGIN) via the registry — no hardcoded plugin import.
function AuthComponent() {
  const name = process.env.VITE_AUTH_PLUGIN || DEFAULT_AUTH_PLUGIN
  const plugin = getDynamicIndex()[name]
  const SignIn = plugin && plugin.SignIn
  return SignIn ? <SignIn /> : null
}

const DynamicGroupNamePage = ({
  leftMenuData,
  isProtected
}: {
  leftMenuData?: MenuType[]
  isProtected?: boolean
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

  if (isProtected) return <AuthComponent />

  return (
    <DefaultLayout leftMenu={{ data: leftMenuData }}>{render}</DefaultLayout>
  )
}

export default DynamicGroupNamePage
