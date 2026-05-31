import React from "react"
import { useRouter } from "@/router"
import { DynamicDocRoute } from "@/utils/routes"

export default function DocMenu({
  isDoc,
  docsHome
}: {
  isDoc: boolean
  docsHome: string
}) {
  const router = useRouter()

  const handleRoute = ({ route }: { route: string }) => {
    if (route === "/") return router.push("/")
    router.push(DynamicDocRoute, route)
  }

  return (
    <div>
      <button
        aria-label="doc or dashboard"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={() =>
          handleRoute({
            route: isDoc ? "/" : docsHome
          })
        }
        className="inline-flex items-center justify-center rounded p-2 text-icon-muted hover:bg-gray-100"
      >
        {isDoc ? (
          /* home-outline */
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        ) : (
          /* book-outline */
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z" />
          </svg>
        )}
      </button>
    </div>
  )
}
