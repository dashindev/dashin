import React from "react"
import Error from "../private/Error"

export default function HTTP404() {
  return <Error statusCode={404} hasLayout={false} />
}
