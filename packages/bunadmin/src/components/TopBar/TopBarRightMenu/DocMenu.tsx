import React from "react"
import { Home, BookOpen } from "lucide-react"
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
        className="inline-flex items-center justify-center rounded-full h-9 w-9 text-icon-muted hover:bg-primary/10 hover:text-primary"
      >
        {isDoc ? <Home size={18} /> : <BookOpen size={18} />}
      </button>
    </div>
  )
}
