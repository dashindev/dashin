import React from "react"
import EvaIcon from "react-eva-icons"
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
    <ul className="w-full max-w-[360px] bg-white list-none p-0">
      <li
        className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
        onClick={handleClick}
      >
        <span className="mr-3 flex items-center">
          <EvaIcon name="settings-outline" size="large" fill="#8f9bb3" />
        </span>
        <span className="flex-1 text-sm">{t("Setting")}</span>
        <span className="text-[#8f9bb3]">
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
              className={`flex items-center pl-10 pr-4 py-2 cursor-pointer transition-[padding-left] duration-500 ease-in-out hover:bg-gray-100 ${item.route === `/${qGroup}/${qName}` ? "bg-gray-200" : ""}`}
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
