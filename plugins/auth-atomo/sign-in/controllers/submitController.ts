import { Values } from "../types"
import userSignInService from "../services/signInService"
import { completeSignIn } from "@dashin-dev/dashin"
import { TFunction } from "i18next"

interface Props {
  t: TFunction
  values: Values
  setSubmitting: (isSubmitting: boolean) => void
}

const submitController = async ({ t, values, setSubmitting }: Props) => {
  await completeSignIn({
    t,
    setSubmitting,
    signIn: () => userSignInService(values),
    // The Atomo client SDK reads its token from localStorage — but only write
    // it after the identity is durably persisted, never on a failed attempt.
    afterPersist: res => {
      if (typeof window !== "undefined" && res.token) {
        localStorage.setItem("atomo_auth_token", res.token)
        localStorage.setItem("token", res.token)
      }
    }
  })
}

export default submitController
