import React, { useEffect, useState } from "react"
import { Globe } from "lucide-react"
import { Menu } from "@headlessui/react"
import { useTranslation } from "react-i18next"
import { i18nMenus } from "@/utils/i18n"
import { BA_DB } from "@/utils/database"
import { SETTING_NAMES } from "@/main"

export default function I18nMenu() {
  const { i18n } = useTranslation()
  const [curCode, setCurCode] = useState<string>()

  useEffect(() => {
    ;(async () => {
      const db = BA_DB
      const setting = db.settings
      const resI18nCode = await setting
        .where("name")
        .equals(SETTING_NAMES.i18n_code)
        .first()
      if (resI18nCode) setCurCode(resI18nCode.value)
    })()
  }, [])

  const handleI18n = ({ code }: { code: string }) => {
    i18n.changeLanguage(code).then(async () => {
      const db = BA_DB
      await db.settings.put({
        name: SETTING_NAMES.i18n_code,
        value: code
      })
      setCurCode(code)
    })
  }

  return (
    <div>
      <Menu as="div" className="relative">
        <Menu.Button className="inline-flex items-center justify-center rounded-full h-9 w-9 text-icon-muted hover:bg-primary/10 hover:text-primary">
          <Globe size={18} />
        </Menu.Button>
        <Menu.Items className="absolute right-0 z-50 mt-1 w-40 origin-top-right rounded-bn bg-content-box py-1 shadow-lg ring-1 ring-bn-border focus:outline-none">
          {i18nMenus.map((item, index) => (
            <Menu.Item key={index}>
              {({ active }) => (
                <button
                  onClick={() => handleI18n({ code: item.code })}
                  className={`${active ? "bg-primary/10 text-primary" : "text-foreground"} ${item.code === curCode ? "bg-primary/10 font-medium" : ""} w-full px-4 py-2 text-left text-sm`}
                >
                  {item.name}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Menu>
    </div>
  )
}
