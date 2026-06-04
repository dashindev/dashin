import React from "react"
import { ProTip, ENV } from "@dashin-dev/dashin"

function Copyright() {
  return (
    <p className="text-sm text-gray-500 text-center">
      {"Copyright © "}
      <a className="text-inherit" href="#">
        {ENV.SITE_NAME}
      </a>{" "}
      {new Date().getFullYear()}
      {"."}
    </p>
  )
}

export default function Home() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="p-6 my-8">
        <h1 className="text-2xl font-bold mb-2">
          Welcome to {ENV.SITE_NAME}
        </h1>
        <ProTip />
        <Copyright />
      </div>
    </div>
  )
}
