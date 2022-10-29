import React from "react"
import { ParsedUrlQuery } from "querystring"
import {
  useRouter,
  CoreContainer,
  SchemaContainer,
  withoutLayout,
  MenuType
} from "@xbuilder/bunadmin"
import PluginTable from "../../components/PluginTable"
import DefaultLayout from "../../components/DefaultLayout"
import Error from "../../components/Error"
import Home from "../../components/Home"
import { SignIn as AuthComponent } from "@xbuilder/bunadmin-auth-local"

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
    case undefined:
      render = <Home />
      break
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
