import { Values } from "../types"
import userSignInService from "../services/signInService"
import {
  BA_DB,
  AuthPrimary as Primary,
  notice,
  SETTING_NAMES
} from "@dashin-dev/dashin"
import { TFunction } from "i18next"

interface Props {
  t: TFunction
  values: Values
  setSubmitting: (isSubmitting: boolean) => void
}

const submitController = async ({ t, values, setSubmitting }: Props) => {
  const res = await userSignInService(values)
  setSubmitting(false)

  if (res && res.user) {
    const db = BA_DB
    const updated_at = Date.now()
    // Persist the Payload JWT so @dashin-dev/source-payload sends it as a
    // Bearer token on every request.
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
    // Full navigation (not router.push): dashin's App reads
    // window.location.pathname and only re-checks auth when it changes, so a
    // client-side push to "/" from "/" leaves the sign-in form mounted until a
    // manual refresh. A real navigation re-inits and clears isProtected.
    window.location.assign("/")
  } else {
    await notice({
      title: t("Sign in failed"),
      severity: "error",
      content: JSON.stringify(res)
    })
  }
}

export default submitController
