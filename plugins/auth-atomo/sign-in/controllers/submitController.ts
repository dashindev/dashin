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
  let previous: Array<[string, string | null]> | undefined
  await completeSignIn({
    t,
    setSubmitting,
    signIn: () => userSignInService(values),
    // The Atomo client SDK reads its token from localStorage — but only write
    // it after identity writes, before commit; compensate if either fails.
    afterPersist: res => {
      if (typeof window !== "undefined" && res.token) {
        previous = ["atomo_auth_token", "token"].map(key => [key, localStorage.getItem(key)])
        localStorage.setItem("atomo_auth_token", res.token)
        localStorage.setItem("token", res.token)
      }
    },
    rollbackPersist: () => {
      previous?.forEach(([key, value]) => {
        if (value === null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
      })
    }
  })
}

export default submitController
