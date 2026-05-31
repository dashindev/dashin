import React from "react"
import Document, { Html, Head, Main, NextScript } from "next/document"
import { ENV } from "@xbuilder/bunadmin"

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang={ENV.I18N_CODE}>
        <Head>
          <meta name="theme-color" content="#3366ff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

MyDocument.getInitialProps = async ctx => {
  return await Document.getInitialProps(ctx)
}
