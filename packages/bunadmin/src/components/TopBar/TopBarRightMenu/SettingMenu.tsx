import React, { useState } from "react"
import { Settings } from "lucide-react"
import { useRouter } from "@/router"
import { Menu } from "@headlessui/react"
import ConfirmDialog from "@/components/Dialog/ConfirmDialog"
import { settingMenus } from "@/utils/config/settingMenus"
import { DynamicRoute } from "@/utils/routes"
import { useTranslation } from "react-i18next"
import { BA_DB } from "@/utils/database"

export default function SettingMenu() {
  const { t } = useTranslation()
  const router = useRouter()
  const { group: qGroup, name: qName } = router.query
  const [modalState, setModalState] = useState({
    open: 0,
    title: "",
    msg: ""
  })

  const handleRoute = (route: string) => {
    if (!route) return
    router.push(DynamicRoute, route)
  }

  const handleClearDb = () => {
    setModalState({
      title: "Delete Local Database",
      open: modalState.open + 1,
      msg: "Do want to delete the local database?"
    })
  }

  return (
    <div>
      <Menu as="div" className="relative">
        <Menu.Button className="inline-flex items-center justify-center rounded-full h-9 w-9 text-icon-muted hover:bg-primary/10 hover:text-primary">
          <Settings size={18} />
        </Menu.Button>
        <Menu.Items className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded-bn bg-content-box py-1 shadow-lg ring-1 ring-bn-border focus:outline-none">
          {settingMenus({ theme: { dashin: { iconColor: "#8f9bb3" } } } as any).map(
            (item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    onClick={() => handleRoute(item.route)}
                    className={`${active ? "bg-primary/10 text-primary" : "text-foreground"} ${item.route === `/${qGroup}/${qName}` ? "bg-primary/10 font-medium" : ""} w-full px-4 py-2 text-left text-sm`}
                  >
                    {t(item.name)}
                  </button>
                )}
              </Menu.Item>
            )
          )}
          <div className="my-1 border-t border-bn-border" />
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleClearDb}
                className={`${active ? "bg-primary/10 text-primary" : "text-foreground"} w-full px-4 py-2 text-left text-sm`}
              >
                {t("Reset Local Database")}
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
      <ConfirmDialog
        openModal={modalState.open}
        title={modalState.title}
        msg={modalState.msg}
        doFunc={async () => {
          await BA_DB.delete()
          window.location.reload()
        }}
      />
    </div>
  )
}
