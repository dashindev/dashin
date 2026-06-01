import { Values } from "../types"
import userSignInService from "../services/signInService"
import {
  BA_DB,
  AuthPrimary as Primary,
  notice,
  Router,
  SETTING_NAMES
} from "@dashin-dev/dashin"
import { TFunction } from "i18next"

interface Props {
  t: TFunction
  values: Values
  setSubmitting: (isSubmitting: boolean) => void
  router: Router
}

const submitController = async ({ t, values, setSubmitting, router }: Props) => {
  const res = await userSignInService(values)
  setSubmitting(false)

  if (res && res.user) {
    const db = BA_DB
    const updated_at = Date.now()
    await db.users.put({
      [Primary]: res.user.username,
      token: res.token,
      id: res.id,
      role: res.user.role,
      details: JSON.stringify(res),
      updated_at
    })
    await db.settings.put({
      name: Primary,
      value: res.user.username,
      updated_at: Date.now()
    })
    await db.settings.put({
      name: SETTING_NAMES.role,
      value: res.user.role,
      updated_at: Date.now()
    })
    await notice({ title: t("Sign in successful") })
    router.push("/")
  } else {
    await notice({
      title: t("Sign in failed"),
      severity: "error",
      content: JSON.stringify(res)
    })
  }
}

export default submitController
