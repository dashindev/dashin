import React from "react"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import Link from "@mui/material/Link"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
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
  AuthPrimary as Primary,
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

export default function SignInContainer() {
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
                {t("Sign in")}
              </Typography>
              <div className={classes.form}>
                <Formik
                  initialValues={{
                    username: "",
                    password: ""
                  }}
                  validate={values => validateController(values, t)}
                  onSubmit={handleOnSubmit}
                >
                  {({ submitForm, isSubmitting }) => (
                    <Form>
                      <BunField
                        component={TextField}
                        name={Primary}
                        type="text"
                        label={t("Username")}
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
                      <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label={t("Remember me")}
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
                        {t("Sign in")}
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
                    <Link href="#" variant="body2">
                      {t("Don't have an account? Sign Up")}
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
