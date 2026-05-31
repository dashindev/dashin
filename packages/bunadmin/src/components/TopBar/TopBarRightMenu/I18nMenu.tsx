import React, { useEffect, useState } from "react"
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
        <Menu.Button className="inline-flex items-center justify-center rounded p-2 text-icon-muted hover:bg-gray-100">
          {/* globe-outline */}
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
          </svg>
        </Menu.Button>
        <Menu.Items className="absolute right-0 z-50 mt-1 w-40 origin-top-right rounded bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
          {i18nMenus.map((item, index) => (
            <Menu.Item key={index}>
              {({ active }) => (
                <button
                  onClick={() => handleI18n({ code: item.code })}
                  className={`${active ? "bg-gray-100" : ""} ${item.code === curCode ? "bg-gray-50 font-medium" : ""} w-full px-4 py-2 text-left text-sm`}
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
