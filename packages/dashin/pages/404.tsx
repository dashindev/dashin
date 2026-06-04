import React from "react"
import Error from "../src/private/Error"

export default function HTTP404() {
  return <Error statusCode={404} hasLayout={false} />
}
