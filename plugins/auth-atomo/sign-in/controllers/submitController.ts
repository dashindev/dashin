import { Values } from "../types"
import userSignInService from "../services/signInService"
import {
  BA_DB,
  AuthPrimary as Primary,
  notice,
  SETTING_NAMES,
} from "@dashin-dev/dashin"
import { TFunction } from "i18next"

interface Props {
  t: TFunction
  values: Values
  setSubmitting: (isSubmitting: boolean) => void
}

const submitController = async ({ t, values, setSubmitting }: Props) => {
  try {
    const res = await userSignInService(values)
    setSubmitting(false)

    if (res && res.user && res.token) {
      const db = BA_DB
      const updated_at = Date.now()

      // Also set token in localStorage for Atomo client
      if (typeof window !== "undefined") {
        localStorage.setItem("atomo_auth_token", res.token)
        localStorage.setItem("token", res.token)
      }

      await db.users.put({
        [Primary]: res.user.username,
        token: res.token,
        id: res.id,
        role: res.user.role,
        details: JSON.stringify(res),
        updated_at,
      })
      await db.settings.put({
        name: Primary,
        value: res.user.username,
        updated_at,
      })
      await db.settings.put({
        name: SETTING_NAMES.role,
        value: res.user.role,
        updated_at,
      })
      await notice({ title: t("Sign in successful") })
      window.location.assign("/")
    } else {
      await notice({
        title: t("Sign in failed"),
        severity: "error",
        content: JSON.stringify(res),
      })
    }
  } catch (err: any) {
    setSubmitting(false)
    await notice({
      title: t("Sign in failed"),
      severity: "error",
      content: err?.message || "Sign in failed",
    })
  }
}

export default submitController
