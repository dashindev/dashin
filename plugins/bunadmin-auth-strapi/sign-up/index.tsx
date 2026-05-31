import React from "react"
import { Form, Formik, Field, ErrorMessage } from "formik"
import validateController from "./controllers/validateController"
import submitController from "./controllers/submitController"
import { Values } from "./types"
import {
  ENV,
  AnimatedRandomBG,
  useTranslation,
  useRouter
} from "@xbuilder/bunadmin"

function Copyright() {
  return (
    <p className="text-center text-[0.8125rem] text-gray-500">
      {"Copyright © "}
      <a href="#" className="text-inherit hover:underline">
        {ENV.SITE_NAME}
      </a>{" "}
      {new Date().getFullYear()}.
    </p>
  )
}

export default function SignUpContainer() {
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
    <div className="relative h-screen overflow-hidden">
      <AnimatedRandomBG />
      <div className="flex w-full items-center justify-center">
        <div className="relative m-8 flex max-w-[400px] flex-col items-center bg-white/60 p-8">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-primary">
            👤
          </div>
          <h1 className="text-xl font-medium">{t("Sign up")}</h1>
          <div className="mt-2 w-full">
            <Formik
              initialValues={{
                username: "",
                email: "",
                password: "",
                password_confirm: ""
              }}
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
                    name="email"
                    type="text"
                    placeholder={t("Email")}
                    className={fieldClass}
                  />
                  <ErrorMessage
                    name="email"
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
                  <Field
                    name="password_confirm"
                    type="password"
                    placeholder={t("Confirm password")}
                    className={fieldClass}
                  />
                  <ErrorMessage
                    name="password_confirm"
                    component="div"
                    className="mt-1 text-xs text-danger"
                  />
                  {isSubmitting && (
                    <div className="mt-2 h-1 w-full animate-pulse rounded bg-primary/40" />
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mb-2 mt-6 w-full rounded bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {t("Sign up")}
                  </button>
                </Form>
              )}
            </Formik>
            <div className="flex justify-between">
              <a href="#" className="text-[0.8125rem] text-primary hover:underline">
                {t("Forgot password?")}
              </a>
              <a
                href="#"
                onClick={() => router.push("/auth/sign-in")}
                className="text-[0.8125rem] text-primary hover:underline"
              >
                {t("I have an account. Sign in")}
              </a>
            </div>
            <div className="mt-10">
              <Copyright />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
