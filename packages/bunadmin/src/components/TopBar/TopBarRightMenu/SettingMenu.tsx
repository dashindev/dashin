import React, { useState } from "react"
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
        <Menu.Button className="inline-flex items-center justify-center rounded p-2 text-icon-muted hover:bg-gray-100">
          {/* settings-outline */}
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.61 3.61 0 0 1 8.4 12 3.61 3.61 0 0 1 12 8.4a3.61 3.61 0 0 1 3.6 3.6 3.61 3.61 0 0 1-3.6 3.6z" />
          </svg>
        </Menu.Button>
        <Menu.Items className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
          {settingMenus({ theme: { bunadmin: { iconColor: "#8f9bb3" } } } as any).map(
            (item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    onClick={() => handleRoute(item.route)}
                    className={`${active ? "bg-gray-100" : ""} ${item.route === `/${qGroup}/${qName}` ? "bg-gray-50 font-medium" : ""} w-full px-4 py-2 text-left text-sm`}
                  >
                    {t(item.name)}
                  </button>
                )}
              </Menu.Item>
            )
          )}
          <div className="my-1 border-t border-gray-200" />
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleClearDb}
                className={`${active ? "bg-gray-100" : ""} w-full px-4 py-2 text-left text-sm`}
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
