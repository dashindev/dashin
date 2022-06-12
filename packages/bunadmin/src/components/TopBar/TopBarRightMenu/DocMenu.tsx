import React from "react"

import { useRouter } from "@/router"
import IconButton from "@material-ui/core/IconButton"
import EvaIcon from "react-eva-icons"
import { useTheme } from "@material-ui/core/styles"
import { DynamicDocRoute } from "@/utils/routes"

export default function DocMenu({
  isDoc,
  docsHome
}: {
  isDoc: boolean
  docsHome: string
}) {
  const theme = useTheme()
  const router = useRouter()

  const handleRoute = ({ route }: { route: string }) => {
    if (route === "/") return router.push("/")
    router.push(DynamicDocRoute, route)
  }

  return (
    // Doc or Dashboard Home Icon
    <div>
      <IconButton
        aria-label="doc or dashboard"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={() =>
          handleRoute({
            route: isDoc ? "/" : docsHome
          })
        }
        color="inherit"
      >
        <EvaIcon
          name={isDoc ? "home-outline" : "book-outline"}
          size="medium"
          fill={theme.bunadmin.iconColor}
        />
      </IconButton>
    </div>
  )
}
