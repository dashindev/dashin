import { Values } from "../types"
import { TFunction } from "i18next"

export default function validateController(values: Values, t: TFunction) {
  const errors: Partial<Values> = {}
  // username
  if (!values.username) {
    errors.username = t("Required")
  } else if (values.username.length < 2) {
    errors.username = t("Username must be at least 2 characters long.")
  }
  // email
  if (!values.email) {
    errors.email = t("Required")
  } else if (/\S+@\S+\.\S+/.test(values.email) == false) {
    errors.email = t("Email format is incorrect.")
  }
  // password
  if (!values.password) {
    errors.password = t("Required")
  } else if (values.password.length < 6) {
    errors.password = t("Password must be at least 6 characters long.")
  }
  // confirm password
  if (!values.password_confirm) {
    errors.password_confirm = t("Required")
  } else if (values.password != values.password_confirm) {
    errors.password_confirm = t("Password and confirm password does not match.")
  }
  return errors
}
