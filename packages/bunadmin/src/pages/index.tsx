import React from "react"
import { ENV, ProTip } from "@xbuilder/bunadmin"

function Copyright() {
  return (
    <p className="text-center text-sm text-icon-muted">
      {"Copyright © "}
      <a href="#" className="text-inherit hover:underline">
        {ENV.SITE_NAME}
      </a>{" "}
      {new Date().getFullYear()}
      {"."}
    </p>
  )
}

export default function Index() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="my-8 p-6">
        <h1 className="mb-2 text-2xl font-medium">
          Welcome to {ENV.SITE_NAME}
        </h1>
        <ProTip />
        <Copyright />
      </div>
    </div>
  )
}
