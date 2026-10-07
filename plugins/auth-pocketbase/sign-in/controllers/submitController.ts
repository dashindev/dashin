import { Values } from "../types"
import userSignInService from "../services/signInService"
import { completeSignIn, Router } from "@dashin-dev/dashin"
import { TFunction } from "i18next"

interface Props {
  t: TFunction
  values: Values
  setSubmitting: (isSubmitting: boolean) => void
  router?: Router
}

const submitController = async ({ t, values, setSubmitting }: Props) => {
  await completeSignIn({
    t,
    setSubmitting,
    signIn: () => userSignInService(values)
  })
}

export default submitController
