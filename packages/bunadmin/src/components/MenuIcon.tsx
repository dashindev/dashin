import React from "react"

import { MenuIcon as MenuIconName, MenuIconType } from "@/core/menu/types"
import EvaIcon from "./EvaIcon"

interface Props {
  name?: string
  icon: MenuIconName
  icon_type: MenuIconType
}

export default function MenuIcon({ name, icon, icon_type }: Props) {
  if (!icon || !icon_type) return <span>Icon</span>

  switch (icon_type) {
    case "eva":
      return (
        <EvaIcon name={icon} size="large" fill="#8f9bb3" />
      )
    case "material":
      return (
        <span className="text-[#8f9bb3] text-xl flex items-center justify-center material-icons">
          {icon}
        </span>
      )
    case "url":
      return (
        <span className="text-[#8f9bb3] flex items-center justify-center">
          <img alt={name} width={18} height={18} src={icon} />
        </span>
      )
    default:
      return <span>Icon</span>
  }
}
