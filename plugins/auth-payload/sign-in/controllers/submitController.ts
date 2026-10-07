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
  // completeSignIn owns the full failure closure: rejected requests (401/403/
  // network/timeout), malformed 2xx envelopes and storage failures all release
  // the submitting state and surface a readable notice — nothing half-persists.
  await completeSignIn({
    t,
    setSubmitting,
    signIn: () => userSignInService(values)
  })
}

export default submitController
