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

const submitController = async ({
  t,
  values,
  setSubmitting,
  router
}: Props) => {
  const res = await userSignInService(values)
  setSubmitting(false)
  // Sign-in successfully
  if (res && res.user) {
    // store user profile
    const primary = Primary
    const updated_at = Date.now()

    const db = BA_DB
    // store auth
    await db.users.put({
      [primary]: res.user.username,
      token: "fake_token",
      id: res.id,
      role: res.user.role,
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
      value: res.user.role,
      updated_at: Date.now()
    })
    // show notice
    await notice({ title: t("Sign in successful") })
    // push to origin url
    router.push("/")
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
