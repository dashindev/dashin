import React, { ReactNode } from "react"

import Divider from "@mui/material/Divider"
import NestedList from "./NestedMenu"
import SettingMenu from "./SettingMenu"
import { Type } from "@/core/menu/types"
import { ENV } from "@/utils/config"

export interface LeftMenuProps {
  data?: Type[]
  offLeftSetting?: boolean
  hideDivider?: boolean
  prepend?: ReactNode
  append?: ReactNode
  appendNested?: ReactNode
  prependSetting?: ReactNode
}

const LeftMenu = ({
  data: leftMenuData,
  offLeftSetting,
  hideDivider,
  prepend,
  append,
  appendNested,
  prependSetting
}: LeftMenuProps) => {
  return (
    <>
      {prepend}
      {leftMenuData && <NestedList data={leftMenuData} />}
      {appendNested}
      {!hideDivider && <Divider style={{ marginTop: 8 }} />}
      {prependSetting}
      {!offLeftSetting && ENV.ON_SETTING && <SettingMenu />}
      {append}
    </>
  )
}

export default LeftMenu
