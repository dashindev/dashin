import { Values } from "../types"
import { TFunction } from "i18next"

export default function validateController(values: Values, t: TFunction) {
  const errors: Partial<Values> = {}
  // email
  if (!values.identifier) {
    errors.identifier = t("Required")
  } else if (values.identifier.length < 2) {
    errors.identifier = t("Username must be at least 2 characters long.")
  }
  // password
  if (!values.password) {
    errors.password = t("Required")
  } else if (values.password.length < 6) {
    errors.password = t("Password must be at least 6 characters long.")
  }
  return errors
}
