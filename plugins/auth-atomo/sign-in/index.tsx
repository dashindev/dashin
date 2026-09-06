import React from "react"
import { Form, Formik, Field, ErrorMessage } from "formik"
import validateController from "./controllers/validateController"
import submitController from "./controllers/submitController"
import { Values } from "./types"
import { ENV, useTranslation } from "@dashin-dev/dashin"

export default function SignInContainer() {
  const { t } = useTranslation("plugins")

  const handleOnSubmit = async (
    values: Values,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    await submitController({ t, values, setSubmitting })
  }

  const fieldClass =
    "mt-4 w-full rounded border border-bn-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-content-box text-foreground"

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-content-bg">
      <div className="m-8 flex max-w-[400px] flex-col items-center rounded-bn bg-content-box p-8 shadow-bn border border-bn-border">
        <h1 className="text-xl font-medium text-foreground">{t("Sign in")}</h1>
        <p className="mt-1 text-xs text-icon-muted">Atomo Content Core</p>
        <div className="mt-2 w-full">
          <Formik
            initialValues={{ username: "", password: "" }}
            validate={values => validateController(values, t)}
            onSubmit={handleOnSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Field
                  name="username"
                  type="text"
                  placeholder={t("Email")}
                  className={fieldClass}
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="mt-1 text-xs text-danger"
                />
                <Field
                  name="password"
                  type="password"
                  placeholder={t("Password")}
                  className={fieldClass}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-xs text-danger"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mb-2 mt-6 w-full rounded-bn bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {t("Sign in")}
                </button>
              </Form>
            )}
          </Formik>
          <p className="mt-6 text-center text-[0.8125rem] text-icon-muted">
            {ENV.SITE_NAME} {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
