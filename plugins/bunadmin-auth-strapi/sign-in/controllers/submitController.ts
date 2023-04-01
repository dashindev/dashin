import { Values } from "../types"
import userSignInService from "../services/signInService"

import {
  BA_DB,
  AuthPrimary as Primary,
  notice,
  Router,
  SETTING_NAMES
} from "@xbuilder/bunadmin"
import { TFunction } from "i18next"

interface Props {
  t: TFunction
  values: Values
  setSubmitting: (isSubmitting: boolean) => void
  router: Router
}

const submitController = async ({ t, values, setSubmitting }: Props) => {
  const res = await userSignInService(values)
  setSubmitting(false)
  // Sign-in successfully
  if (res && res.jwt && res.user) {
    // store user profile
    const primary = Primary
    const updated_at = Date.now()

    const db = BA_DB
    // store auth
    await db.users.put({
      [primary]: res.user.username,
      id: res.user.id,
      token: res.jwt,
      role: res.user.role?.name,
      details: JSON.stringify(res),
      updated_at
    })
    // update username in setting
    await db.settings.put({
      name: Primary,
      value: res.user.username,
      updated_at: Date.now()
    })
    // update role in setting
    await db.settings.put({
      name: SETTING_NAMES.role,
      value: res.user.role?.name,
      updated_at: Date.now()
    })
    // show notice
    await notice({ title: t("Sign in successful") })
    // push to origin url
    window.location.reload()
  } else {
    // show notice
    await notice({
      title: t("Sign in failed"),
      severity: "error",
      content: JSON.stringify(res)
    })
  }
}

export default submitController
