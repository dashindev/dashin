import React from "react"
import { Form, Formik, Field, ErrorMessage } from "formik"
import validateController from "./controllers/validateController"
import submitController from "./controllers/submitController"
import { Values } from "./types"
import {
  ENV,
  AnimatedRandomBG,
  Button,
  Input,
  useTranslation,
  useRouter
} from "@dashin-dev/dashin"

function Copyright() {
  return (
    <p className="text-center text-[0.8125rem] text-icon-muted">
      {"Copyright © "}
      <a href="#" className="text-inherit hover:underline">
        {ENV.SITE_NAME}
      </a>{" "}
      {new Date().getFullYear()}.
    </p>
  )
}

export default function SignInContainer() {
  const { t } = useTranslation("plugins")
  const router = useRouter()

  const handleOnSubmit = async (
    values: Values,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    await submitController({ t, values, setSubmitting, router })
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatedRandomBG />
      <div className="flex w-full items-center justify-center">
        <div className="relative m-8 flex max-w-[400px] flex-col items-center rounded-bn border border-bn-border bg-content-box/80 p-8 shadow-bn backdrop-blur">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            🔒
          </div>
          <h1 className="text-xl font-medium">{t("Sign in")}</h1>
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
                    as={Input}
                    className="mt-4 w-full"
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
                    as={Input}
                    className="mt-4 w-full"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-1 text-xs text-danger"
                  />
                  <label className="mt-2 flex items-center gap-2 text-sm text-icon-muted">
                    <input type="checkbox" value="remember" />
                    {t("Remember me")}
                  </label>
                  {isSubmitting && (
                    <div className="mt-2 h-1 w-full animate-pulse rounded-bn bg-primary/40" />
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mb-2 mt-6 w-full py-2.5"
                  >
                    {t("Sign in")}
                  </Button>
                </Form>
              )}
            </Formik>
            <div className="flex justify-between">
              <a href="#" className="text-[0.8125rem] text-primary hover:underline">
                {t("Forgot password?")}
              </a>
              <a href="#" className="text-[0.8125rem] text-primary hover:underline">
                {t("Don't have an account? Sign Up")}
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
