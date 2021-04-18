import React from "react"

import Divider from "@material-ui/core/Divider"
import NestedList from "./NestedMenu"
import SettingMenu from "./SettingMenu"
import { Type } from "@/core/menu/types"
import { ENV } from "@/utils/config"

export interface LeftMenuProps {
  data?: Type[]
  offLeftSetting?: boolean
}

const LeftMenu = ({ data: leftMenuData, offLeftSetting }: LeftMenuProps) => {
  return (
    <>
      {leftMenuData && <NestedList data={leftMenuData} />}
      <Divider />
      {!offLeftSetting && ENV.ON_SETTING && <SettingMenu />}
    </>
  )
}

export default LeftMenu
