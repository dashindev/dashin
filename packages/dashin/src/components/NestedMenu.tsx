import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Type } from "@/core/menu/types"
import MenuIcon from "./MenuIcon"
import { useRouter } from "@/router"
import { DynamicRoute, DynamicDocRoute } from "@/utils/routes"
import { useTranslation } from "react-i18next"
import { SETTING_NAMES, specialPluginSlug } from "@/utils"
import { BA_DB } from "@/utils/database"

interface Props {
  data: Type[]
  collapsed?: boolean
}

export default function NestedList({ data, collapsed }: Props): any {
  const { t } = useTranslation("plugins")
  const router = useRouter()
  let { group: qGroup = "", name: qName } = router.query
  const [open, setOpen] = useState({} as { [key: string]: boolean })
  const [currentRole, setCurrentRole] = useState("")
  const [parentMenus, setParentMenus] = useState<string[]>([])
  const [selectedRootName, setSelectedRootName] = useState<string>()

  const [flyoutTarget, setFlyoutTarget] = useState<string | null>(null)
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 })
  const closeTimer = useRef(0)

  const showFlyout = (name: string, el: HTMLElement) => {
    window.clearTimeout(closeTimer.current)
    const rect = el.getBoundingClientRect()
    setFlyoutPos({ top: rect.top, left: rect.right })
    setFlyoutTarget(name)
  }
  const delayHideFlyout = () => {
    closeTimer.current = window.setTimeout(() => setFlyoutTarget(null), 150)
  }
  const keepFlyout = () => window.clearTimeout(closeTimer.current)
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  if (router.route === DynamicDocRoute) {
    qGroup = "docs/" + router.query.category
    qName = router.query.slug
  }

  useEffect(() => {
    if (typeof qGroup === "object") return
    const parent = qGroup.replace("docs/", "")
    handleOpen({ name: parent })
    ;(async () => {
      const db = BA_DB
      const settingRes = await db.settings
        .where("name")
        .equals(SETTING_NAMES.role)
        .first()
      const role = (settingRes && settingRes.value) || ""
      setCurrentRole(role)
    })()
    const parentTmp: string[] = []
    data.map(item => {
      if (item.parent && item.parent !== "" && !parentTmp.includes(item.parent))
        parentTmp.push(item.parent)
    })
    setParentMenus(parentTmp)

    if (selectedRootName) {
      setOpen({
        ...open,
        [selectedRootName]: true
      })
    }
  }, [])

  const handleOpen = ({ name }: { name: string }) => {
    setOpen({
      ...open,
      [name]: !open[name]
    })
  }

  const handleClick = ({ name, slug }: { name: string; slug?: string }) => {
    if (parentMenus.includes(name)) {
      return handleOpen({ name })
    }

    if (slug !== undefined && slug !== "") {
      const isUrl = new RegExp("^http.*").test(slug)

      if (!isUrl) {
        if (router.route === DynamicDocRoute) {
          return router.push(DynamicDocRoute, slug)
        }
        router.push(DynamicRoute, slug)
      } else {
        router.push(slug)
      }
    } else {
      handleOpen({ name })
    }
  }

  if (data.length === 0) return null

  data = [...data]
  data = data.sort(function(a, b) {
    return Number(b.rank) - Number(a.rank)
  })

  function isAllowedRole(currentRole: string, allowedRole: string): boolean {
    const currentRoles: string[] = currentRole.split(",")
    const allowedRoles: string[] = allowedRole.split(",")

    for (let i = 0; i < currentRoles.length; i++) {
      if (allowedRoles.includes(currentRoles[i])) return true
      if (allowedRole === currentRoles[i]) return true
    }

    if (allowedRoles.includes(currentRole)) return true
    if (allowedRole && allowedRole !== currentRole) return false

    return false
  }

  const rootItems = data.filter(item => item.parent === "")

  return (
    <>
      {!collapsed && (
        <div className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-icon-muted uppercase">
          Main
        </div>
      )}
      {collapsed && <div className="pt-2" />}
      {rootItems.map(item => {
        const { name, label, icon, icon_type, role } = item

        if (role && !isAllowedRole(currentRole, role)) return null

        let { slug } = item
        if (slug) slug = specialPluginSlug(slug)

        const children = data.filter(i => i.parent === name)
        const hasChildren = children.length > 0
        const isActive = slug === `/${qGroup}/${qName}` ||
          children.some(c => {
            let s = c.slug
            if (s) s = specialPluginSlug(s)
            return s === `/${qGroup}/${qName}`
          })

        return (
          <ul key={name} className="w-full max-w-[360px] bg-sidebar p-0 list-none">
            <li
              className={`flex items-center ${
                collapsed ? "justify-center mx-1 px-2" : "mx-2 px-3"
              } py-2 cursor-pointer rounded-bn hover:bg-primary/10 ${
                isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground"
              }`}
              onClick={() => !collapsed && handleClick({ name, slug })}
              onMouseEnter={collapsed ? e => showFlyout(name, e.currentTarget) : undefined}
              onMouseLeave={collapsed ? delayHideFlyout : undefined}
            >
              <span className={`${collapsed ? "" : "mr-3"} flex items-center`}>
                <MenuIcon name={name} icon={icon} icon_type={icon_type} />
              </span>
              {!collapsed && <span className="flex-1 text-sm">{t(label || name)}</span>}
              {!collapsed && hasChildren && (
                <span className="text-icon-muted text-sm">
                  {open[name] ? (
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
                  ) : (
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                  )}
                </span>
              )}
            </li>
            {!collapsed && hasChildren && (
              <ul className={`list-none p-0 overflow-hidden transition-all duration-300 ${open[name] ? "max-h-96" : "max-h-0"}`}>
                {children.map(item => {
                  const { name, label, parent } = item
                  let { slug } = item
                  if (slug) slug = specialPluginSlug(slug)
                  const isSelected = slug === `/${qGroup}/${qName}`

                  if (isSelected && !selectedRootName)
                    setSelectedRootName(parent)

                  return (
                    <li
                      key={name}
                      className={`pl-10 pr-4 py-2 cursor-pointer rounded-bn transition-[padding-left] duration-500 ease-in-out hover:bg-primary/10 ${isSelected ? "bg-primary/10 text-primary" : "text-foreground"}`}
                      onClick={() => handleClick({ name, slug })}
                    >
                      <span className="text-sm">{t(label || name)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </ul>
        )
      })}

      {collapsed && flyoutTarget && createPortal(
        <div
          className="fixed bg-sidebar border border-bn-border rounded-r-bn shadow-xl py-1 z-[1400] min-w-[180px]"
          style={{ left: flyoutPos.left, top: flyoutPos.top }}
          onMouseEnter={keepFlyout}
          onMouseLeave={() => setFlyoutTarget(null)}
        >
          {(() => {
            const target = rootItems.find(d => d.name === flyoutTarget)
            if (!target) return null
            const children = data.filter(i => i.parent === flyoutTarget)

            if (children.length === 0) {
              let s = target.slug
              if (s) s = specialPluginSlug(s)
              return (
                <div
                  className="px-3 py-2 text-sm text-foreground cursor-pointer hover:bg-primary/10 rounded-r-bn"
                  onClick={() => { handleClick({ name: target.name, slug: s }); setFlyoutTarget(null) }}
                >
                  {t(target.label || target.name)}
                </div>
              )
            }

            return (
              <>
                <div className="px-3 py-1.5 text-xs font-semibold text-icon-muted uppercase tracking-wide">
                  {t(target.label || target.name)}
                </div>
                {children.map(child => {
                  let s = child.slug
                  if (s) s = specialPluginSlug(s)
                  const isSelected = s === `/${qGroup}/${qName}`
                  return (
                    <div
                      key={child.name}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 ${
                        isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                      }`}
                      onClick={() => { handleClick({ name: child.name, slug: s }); setFlyoutTarget(null) }}
                    >
                      {t(child.label || child.name)}
                    </div>
                  )
                })}
              </>
            )
          })()}
        </div>,
        document.body
      )}
    </>
  )
}
