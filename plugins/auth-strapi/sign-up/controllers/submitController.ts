import { Values } from "../types"
import userSignUpService from "../services/signUpService"
import { completeSignIn, request, ENV, Router } from "@dashin-dev/dashin"
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
    successTitle: t("Sign up successful"),
    failureTitle: t("Sign up failed"),
    signIn: async () => {
      const resSign = await userSignUpService(values)
      if (!resSign || !resSign.jwt) return { errors: resSign || "Sign up failed" }

      // Get role data from '/users/me?populate=*'
      const user = await request("/users/me?populate=*", {
        prefix: ENV.AUTH_URL,
        method: "GET",
        headers: { Authorization: `Bearer ${resSign.jwt}` }
      })
      if (!user || !user.username) return { errors: "Sign up failed" }

      return {
        id: user.id,
        token: resSign.jwt,
        user: { username: user.username, role: user.role?.name },
        details: user
      }
    }
  })
}

export default submitController
