import React from "react"
import { useRouter } from "@/router"
import LocalLeftMenuContainer from "@/core/menu"
import MigrationContainer from "@/core/migration"
import SchemaManagerContainer from "@/core/schema"
import AuthInfoContainer from "@/core/auth"
import BunadminSettingContainer from "@/core/setting"
import { BunadminDatabase } from ".."

type Props = {
  db?: BunadminDatabase
}

export default function CoreContainer({ db }: Props) {
  const router = useRouter()
  const { name } = router.query

  let container = null

  switch (name) {
    case "left-menu":
      container = <LocalLeftMenuContainer />
      break
    case "migration":
      container = <MigrationContainer db={db} />
      break
    case "schema":
      container = <SchemaManagerContainer />
      break
    case "auth":
      container = <AuthInfoContainer />
      break
    case "setting":
      container = <BunadminSettingContainer />
  }

  return <>{container}</>
}
