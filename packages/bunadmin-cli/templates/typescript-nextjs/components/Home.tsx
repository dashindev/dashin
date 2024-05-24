import React from "react"
import { Container, Typography, Box, Link } from "@mui/material"
import { ProTip, ENV } from "@xbuilder/bunadmin"

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

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box p={3} my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to {ENV.SITE_NAME}
        </Typography>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  )
}
