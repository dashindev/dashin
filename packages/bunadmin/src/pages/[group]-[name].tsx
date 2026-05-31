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
  const stats = isListView
    ? [
        { label: "Total Posts", value: "128", delta: "All time posts", trend: "neutral" as const, spark: [4, 6, 5, 8, 7, 9, 11] },
        { label: "Published", value: "45", delta: "35.2% of total", trend: "up" as const, spark: [2, 3, 5, 4, 6, 7, 8] },
        { label: "Pending", value: "28", delta: "21.9% of total", trend: "neutral" as const, spark: [3, 2, 4, 3, 5, 4, 6] },
        { label: "Rejected", value: "21", delta: "16.4% of total", trend: "down" as const, spark: [5, 4, 3, 4, 2, 3, 2] }
      ]
    : undefined

  return (
    <DefaultLayout
      leftMenu={{ data: leftMenuData }}
      layout={layout}
      stats={stats}
      sidebarUpgrade={{
        title: "BunAdmin Pro",
        description: "Unlock advanced features and premium components.",
        cta: "Upgrade Now"
      }}
    >
      {render}
    </DefaultLayout>
  )
}

export default DynamicGroupNamePage
