import React, { Dispatch } from "react"
import { TFunction } from "i18next"

export default function NoticeTabs({
  t,
  tab,
  setTab
}: {
  t: TFunction
  tab: number
  setTab: Dispatch<number>
}) {
  return (
    <div className="bg-white shadow-sm">
      <div className="flex" role="tablist" aria-label="core notice tabs">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === 0
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab(0)}
          role="tab"
          aria-selected={tab === 0}
        >
          {String(t("Local Notices"))}
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === 1
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab(1)}
          role="tab"
          aria-selected={tab === 1}
        >
          {String(t("Online Notifications"))}
        </button>
      </div>
      <hr className="border-gray-200" />
    </div>
  )
}
