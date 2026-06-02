import React from "react"
import errorMessages from "./errorMessages"
import { ErrorMsg } from "./types"
import { useRouter } from "@/router"
import DefaultLayout from "../DefaultLayout"
import { ErrorProps } from "@/components"

function Error({ statusCode, hasLayout, message, redirect }: ErrorProps) {
  const router = useRouter()

  const msg = (msg: ErrorMsg) => (
    <div className="p-4 font-light">
      <h5 className="inline text-xl">
        {msg.title}
        {" - "}
      </h5>
      <h5 className="inline text-xl text-danger">
        <small>Error {statusCode}</small>
      </h5>
      <div className="py-2" />
      {message || msg.message}
      <div className="py-2" />
      <button
        onClick={() => router.push(redirect || "/")}
        className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
      >
        {redirect ? "Redirect" : "Take Me Home"}
      </button>
    </div>
  )

  const body = (
    <div className="p-6">
      {statusCode
        ? msg(errorMessages[statusCode])
        : "An error occurred on client"}
    </div>
  )

  if (!hasLayout) return body

  return <DefaultLayout>{body}</DefaultLayout>
}

export interface ErrorGetProps {
  res: {
    statusCode: string
  }
  err: {
    statusCode: number
  }
}

Error.getInitialProps = ({ res, err }: ErrorGetProps) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
