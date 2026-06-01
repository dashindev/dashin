import { Values } from "../types"
import userSignInService from "../services/signInService"

import {
  BA_DB,
  AuthPrimary as Primary,
  notice,
  Router,
  SETTING_NAMES,
  request,
  ENV
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
  const resSign = await userSignInService(values)

  // Get role data from '/users/me?populate=*'
  const res = await request("/users/me?populate=*", {
    prefix: ENV.AUTH_URL,
    method: "GET",
    headers: {
      Authorization: `Bearer ${resSign.jwt}`
    }
  })
  const user = res
  setSubmitting(false)
  // Sign-in successfully
  if (resSign && resSign.jwt && user) {
    // store user profile
    const primary = Primary
    const updated_at = Date.now()

    const db = BA_DB
    // store auth
    await db.users.put({
      [primary]: user.username,
      id: user.id,
      token: resSign.jwt,
      role: user.role?.name,
      details: JSON.stringify(res),
      updated_at
    })
    // update username in setting
    await db.settings.put({
      name: Primary,
      value: user.username,
      updated_at: Date.now()
    })
    // update role in setting
    await db.settings.put({
      name: SETTING_NAMES.role,
      value: user.role?.name,
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
