import React from "react"
import Error, { ErrorGetProps } from "@/private/Error"

function ErrorPage({ statusCode }: { statusCode: number }) {
  return <Error statusCode={statusCode} hasLayout={true} />
}

Error.getInitialProps = ({ res, err }: ErrorGetProps) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
