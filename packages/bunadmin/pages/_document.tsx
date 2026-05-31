import React from "react"
import Document, { Html, Head, Main, NextScript } from "next/document"
import { resetServerContext } from "react-beautiful-dnd"
import { defaultTheme, ENV } from "../src"

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang={ENV.I18N_CODE}>
        <Head>
          {/* PWA primary color */}
          <meta
            name="theme-color"
            content={defaultTheme.palette.primary.main}
          />
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
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
  const originalRenderPage = ctx.renderPage

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props => {
        resetServerContext()
        return <App {...props} />
      }
    })

  return await Document.getInitialProps(ctx)
}
