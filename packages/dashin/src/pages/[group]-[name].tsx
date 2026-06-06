import React from "react"
import { useRouter } from "@/router"
import { ParsedUrlQuery } from "querystring"
import {
  CoreContainer,
  SchemaContainer,
  withoutLayout,
  MenuType
} from "../../src"
import { LAYOUT_A } from "@/utils/themes/layouts"
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

  // The KPI stat band + modern layout apply to schema/list views only —
  // not the welcome page (group undefined), auth, or core pages.
  const isListView =
    group !== undefined && group !== "core" && group !== "auth"

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

  // Modern layout (mockup-3): KPI stat band on list views + upgrade footer.
  const layout = {
    ...LAYOUT_A,
    statBand: isListView,
    sidebarFooter: "upgrade" as const,
    buttons: "labeled" as const
  }
  // The stat band is now data-driven: the <Table> computes real totals +
  // per-status distribution and pushes them up via StatsContext (see
  // components/Table). No hardcoded placeholders here.
  return (
    <DefaultLayout
      leftMenu={{ data: leftMenuData }}
      layout={layout}
      sidebarUpgrade={{
        title: "Dashin Pro",
        description: "Advanced features for teams — coming soon.",
        cta: "Join the waitlist",
        onClick: () =>
          window.open("https://dashin.dev/pro", "_blank", "noopener")
      }}
    >
      {render}
    </DefaultLayout>
  )
}

export default DynamicGroupNamePage
