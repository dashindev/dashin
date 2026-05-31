import React from "react"
import EvaIcon from "../../EvaIcon"
import { Icons } from "./material-table-shim"

/**
 * Returns a name->renderer map of icons (material-table compatible shape).
 * MUI <Icon> wrapper removed; EvaIcon rendered directly.
 */
export default function tableIcons({ theme }: { theme: any }): Icons {
  const color: string = theme.bunadmin.iconColor

  const icon = (name: string, size: any = "large") =>
    React.forwardRef<HTMLSpanElement>((props, ref) => (
      <span ref={ref} {...props}>
        <EvaIcon name={name} size={size} fill={color} />
      </span>
    ))

  return {
    Add: icon("file-add"),
    Edit: icon("edit-2-outline"),
    Delete: icon("trash-2-outline"),
    Search: icon("search", "medium"),
    ResetSearch: icon("close", "medium"),
    PreviousPage: icon("arrow-ios-back"),
    NextPage: icon("arrow-ios-forward"),
    FirstPage: icon("arrowhead-left"),
    LastPage: icon("arrowhead-right"),
    SortArrow: icon("arrow-ios-downward-outline", "medium")
  }
}
