import React, { ReactNode } from "react"

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
  collapsed?: boolean
}

const LeftMenu = ({
  data: leftMenuData,
  offLeftSetting,
  hideDivider,
  prepend,
  append,
  appendNested,
  prependSetting,
  collapsed
}: LeftMenuProps) => {
  return (
    <>
      {prepend}
      {leftMenuData && <NestedList data={leftMenuData} collapsed={collapsed} />}
      {appendNested}
      {prependSetting}
      {!offLeftSetting && ENV.ON_SETTING && (
        <>
          {!collapsed && (
            <div className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-icon-muted uppercase">
              System
            </div>
          )}
          {collapsed && <div className="my-2 mx-3 border-t border-bn-border" />}
          <SettingMenu collapsed={collapsed} />
        </>
      )}
      {append}
    </>
  )
}

export default LeftMenu
