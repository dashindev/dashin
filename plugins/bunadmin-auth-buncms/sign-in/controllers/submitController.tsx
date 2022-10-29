import { Values } from "../types"
import userSignInService from "../services/signInService"

import {
  AuthPrimary as Primary,
  notice,
  Router,
  BA_DB
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
  if (res && res.token) {
    // store user profile
    const primary = Primary
    const updated_at = Date.now()

    const db = BA_DB
    // store auth
    await db.users.put({
      [primary]: res.username,
      id: res.id,
      token: res.token,
      role: res.role,
      details: JSON.stringify(res),
      updated_at
    })
    // update username in setting
    await db.settings.put({
      name: Primary,
      value: res[Primary],
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
