import React from "react"
import EvaIcon from "../EvaIcon"
import { settingMenus } from "@/utils/config/settingMenus"
import { useRouter } from "@/router"
import { DynamicRoute } from "@/utils/routes"
import { useTranslation } from "react-i18next"

export default function SettingMenu() {
  const { t } = useTranslation()
  const router = useRouter()
  const { group: qGroup, name: qName } = router.query
  const [open, setOpen] = React.useState(true)

  const handleClick = () => {
    setOpen(!open)
  }

  const handleRoute = ({ route }: { route: string }) => {
    router.push(DynamicRoute, route)
  }

  return (
    <ul className="w-full max-w-[360px] bg-sidebar list-none p-0">
      <li
        className="flex items-center mx-2 px-3 py-2 cursor-pointer rounded-bn text-foreground hover:bg-primary/10"
        onClick={handleClick}
      >
        <span className="mr-3 flex items-center">
          <EvaIcon name="settings-outline" size="medium" fill="currentColor" />
        </span>
        <span className="flex-1 text-sm">{t("Setting")}</span>
        <span className="text-icon-muted">
          {open ? (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
          ) : (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
          )}
        </span>
      </li>
      {open && (
        <ul className="list-none p-0">
          {settingMenus().map((item, index) => (
            <li
              key={index}
              className={`flex items-center mx-2 pl-9 pr-3 py-2 cursor-pointer rounded-bn transition-[padding-left] duration-500 ease-in-out hover:bg-primary/10 ${item.route === `/${qGroup}/${qName}` ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
              onClick={() => handleRoute({ route: item.route })}
            >
              {item.icon && <span className="mr-3 flex items-center">{item.icon}</span>}
              <span className="text-sm">{t(item.name)}</span>
            </li>
          ))}
        </ul>
      )}
    </ul>
  )
}
