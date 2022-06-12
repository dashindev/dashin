import { Values } from "../types"
import userSignInService from "../services/signInService"

import {
  rxDb,
  Setting,
  Auth,
  AuthPrimary as Primary,
  notice,
  SettingNames,
  Router
} from "@bunred/bunadmin"
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
}: Props) => {
  const res = await userSignInService(values)
  setSubmitting(false)
  // Sign-in successfully
  if (res && res.user) {
    // store user profile
    const primary = Primary
    const updated_at = Date.now()

    const db = await rxDb()
    // store auth
    await db[Auth.name].upsert({
      [primary]: res.user.username,
      id: res.id,
      role: res.user.role,
      details: JSON.stringify(res),
      updated_at
    })
    // update username in setting
    await db[Setting.name].upsert({
      name: Primary,
      value: res.user.username,
      updated_at: Date.now()
    })
    // update role in setting
    await db[Setting.name].upsert({
      name: SettingNames.role,
      value: res.user.role,
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
