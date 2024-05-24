import React from "react"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import LockOutlinedIcon from "@mui/icons-material/PeopleOutline"
import Typography from "@mui/material/Typography"
import { Form, Formik } from "formik"
import { TextField } from "formik-mui"
import { Grow, LinearProgress } from "@mui/material"
import validateController from "./controllers/validateController"
import useStyles from "./styles"
import submitController from "./controllers/submitController"
import { Values } from "./types"
import {
  ENV,
  BunField,
  AnimatedRandomBG,
  useTranslation,
  useRouter
} from "@xbuilder/bunadmin"

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="#">
        {ENV.SITE_NAME}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  )
}

export default function SignUpContainer() {
  const { t } = useTranslation("plugins")
  const router = useRouter()
  const classes = useStyles()

  const handleOnSubmit = async (
    values: Values,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    await submitController({ t, values, setSubmitting, router })
  }

  return (
    <>
      <Grid container component="main" className={classes.root}>
        {/* bg */}
        <AnimatedRandomBG />
        <div className={classes.loginArea}>
          <Grow in addEndListener={() => null}>
            <div className={classes.paper}>
              <Avatar className={classes.avatar}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                {t("Sign up")}
              </Typography>
              <div className={classes.form}>
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
                  {({ submitForm, isSubmitting }) => (
                    <Form>
                      <BunField
                        component={TextField}
                        name="username"
                        type="text"
                        label={t("Username")}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                      />
                      <BunField
                        component={TextField}
                        name="email"
                        type="text"
                        label={t("Email")}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                      />
                      <BunField
                        component={TextField}
                        type="password"
                        label={t("Password")}
                        name="password"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                      />
                      <BunField
                        component={TextField}
                        type="password"
                        label={t("Confirm password")}
                        name="password_confirm"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                      />
                      {isSubmitting && <LinearProgress />}
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={isSubmitting}
                        onClick={submitForm}
                      >
                        {t("Sign up")}
                      </Button>
                    </Form>
                  )}
                </Formik>
                <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      {t("Forgot password?")}
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link
                      href="#"
                      onClick={() => router.push("/auth/sign-in")}
                      variant="body2"
                    >
                      {t("I have an account. Sign in")}
                    </Link>
                  </Grid>
                </Grid>
                <Box mt={5}>
                  <Copyright />
                </Box>
              </div>
            </div>
          </Grow>
        </div>
      </Grid>
    </>
  )
}
