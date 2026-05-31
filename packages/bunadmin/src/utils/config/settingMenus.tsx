import React from "react"
import EvaIcon, { EvaIconProps } from "react-eva-icons"
import { LocalDataRoute } from "../routes"

interface Res {
  name: string
  route: string
  icon: React.ReactElement<EvaIconProps>
}

export const settingMenus = (_opts?: any) =>
  [
    {
      name: "Menu Setting",
      route: LocalDataRoute.leftMenu,
      icon: (
        <EvaIcon name="link-outline" size="large" fill="#8f9bb3" />
      )
    },
    {
      name: "Schema Manager",
      route: LocalDataRoute.schema,
      icon: (
        <EvaIcon name="layers-outline" size="large" fill="#8f9bb3" />
      )
    },
    {
      name: "Data Migration",
      route: LocalDataRoute.migration,
      icon: (
        <EvaIcon name="sync-outline" size="large" fill="#8f9bb3" />
      )
    }
  ] as Res[]
