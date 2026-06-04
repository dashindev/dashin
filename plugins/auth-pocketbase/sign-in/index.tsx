import React from "react"
import { Form, Formik, Field, ErrorMessage } from "formik"
import validateController from "./controllers/validateController"
import submitController from "./controllers/submitController"
import { Values } from "./types"
import { ENV, useTranslation, useRouter } from "@dashin-dev/dashin"

export default function SignInContainer() {
  const { t } = useTranslation("plugins")
  const router = useRouter()

  const handleOnSubmit = async (
    values: Values,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    await submitController({ t, values, setSubmitting, router })
  }

  const fieldClass =
    "mt-4 w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-content-bg">
      <div className="m-8 flex max-w-[400px] flex-col items-center rounded bg-white p-8 shadow">
        <h1 className="text-xl font-medium">{t("Sign in")}</h1>
        <p className="mt-1 text-xs text-icon-muted">PocketBase</p>
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
                  placeholder={t("Username")}
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
                  className="mb-2 mt-6 w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {t("Sign in")}
                </button>
              </Form>
            )}
          </Formik>
          <p className="mt-6 text-center text-[0.8125rem] text-gray-500">
            {ENV.SITE_NAME} {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
