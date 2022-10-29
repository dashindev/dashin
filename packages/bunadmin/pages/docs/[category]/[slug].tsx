import React, { useEffect, useState } from "react"
import { Type } from "@/core/menu/types"
import { Box, Link, Button } from "@material-ui/core"
import dynamic from "next/dynamic"
import TableSkeleton from "@/components/Table/components/TableSkeleton"
import Head from "next/head"
import { MDXProvider } from "@mdx-js/react"
import { ParsedUrlQuery } from "querystring"
import { useRouter } from "next/router"
import { defaultTheme, DynamicDocRoute, ENV } from "@/utils"
import { createTheme, createStyles, makeStyles } from "@material-ui/core/styles"
import { ThemeProvider } from "@material-ui/styles"

import PrismHighlight, { defaultProps } from "prism-react-renderer"
import EvaIcon from "react-eva-icons"
import DefaultLayout from "@/private/DefaultLayout"
import Error from "@/private/Error"
// import prismTheme from "prism-react-renderer/themes/vsDark"
const prismCss = "/assets/css/prism.css"

const REMOTE_BRANCH = "https://github.com/xbuilder/bunadmin/blob/master"

export default function DocsCategorySlug() {
  const classes = useStyles()
  const router = useRouter()
  const { category, slug } = router.query as ParsedUrlQuery
  const [pagination, setPagination] = useState<PaginationType>({})
  const [menuData, setMenuData] = useState<Type[]>([])

  const bunadminDocPath = "@xbuilder/bunadmin-docs"

  useEffect(() => {
    ;(async () => {
      try {
        const content = await import(
          `../../../.bunadmin/dynamic/${bunadminDocPath}/menus`
        )
        const menuData: Type[] = content ? content.menu : []
        setMenuData(menuData)
      } catch (e) {}
    })()
  }, [])

  useEffect(() => {
    const currentPageIndex = menuData.findIndex(
      item => item.slug === `/docs/${category}/${slug}`
    )
    const previousData =
      menuData[currentPageIndex - 1] || menuData[currentPageIndex - 2]
    const nextData =
      menuData[currentPageIndex + 1] || menuData[currentPageIndex + 2]
    setPagination({
      previous:
        previousData && previousData.label && previousData && previousData.slug
          ? {
              title: previousData.label,
              uri: previousData.slug
            }
          : undefined,
      next:
        nextData && nextData.label && nextData && nextData.slug
          ? {
              title: nextData.label,
              uri: nextData.slug
            }
          : undefined
    })
  }, [slug, menuData])

  const DocsComponent = dynamic({
    loader: () =>
      import(
        `../../../../../plugins/${bunadminDocPath}/${category}/${slug}.mdx`
      ),
    loading: () => <TableSkeleton title={`${slug} loading...`} />
  })

  return (
    <>
      <Head>
        <title>
          {slug} - {category} - {ENV.SITE_NAME}
        </title>
        {<link rel="stylesheet" href={prismCss} />}
      </Head>
      <ThemeProvider theme={theme}>
        <DefaultLayout leftMenu={{ data: menuData, offLeftSetting: true }}>
          {slug ? (
            <Box className={classes.DocsBox} p={3} pt={1}>
              <DocsHeader />
              <MDXProvider components={{ code: Code }}>
                <DocsComponent />
              </MDXProvider>
              <DocsPagination />
            </Box>
          ) : (
            <Error statusCode={404} hasLayout={false} />
          )}
        </DefaultLayout>
      </ThemeProvider>
    </>
  )

  function DocsHeader() {
    return (
      <Box position="relative" display="flex" justifyContent="flex-end">
        <Button
          className={classes.DocsEditThis}
          component="a"
          href={
            REMOTE_BRANCH +
            `/plugins/${bunadminDocPath}/${category}/${slug}.mdx`
          }
          target="_blank"
          rel="noopener nofollow"
          size="small"
        >
          Edit this page
        </Button>
      </Box>
    )
  }

  function DocsPagination() {
    return (
      <Box
        className={classes.DocsPagination}
        display="flex"
        justifyContent="space-between"
      >
        <Link href="#" onClick={() => pagePush(pagination.previous)}>
          {pagination.previous ? (
            <Box display="flex" alignItems="center">
              <EvaIcon
                name="arrow-ios-back-outline"
                size="xlarge"
                fill="gray"
              />
              <Box ml={1}>
                <span>PREVIOUS</span>
                <h5>{pagination.previous.title}</h5>
              </Box>
            </Box>
          ) : (
            <Box />
          )}
        </Link>
        {pagination.next && (
          <Link href="#" onClick={() => pagePush(pagination.next)}>
            <Box display="flex" alignItems="center">
              <Box mr={1} textAlign="right">
                <span>NEXT</span>
                <h5>{pagination.next.title}</h5>
              </Box>
              <EvaIcon
                name="arrow-ios-forward-outline"
                size="xlarge"
                fill="gray"
              />
            </Box>
          </Link>
        )}
      </Box>
    )
  }

  async function pagePush(obj?: PaginationData) {
    if (!obj) return
    await router.push(DynamicDocRoute, obj.uri)
  }

  function Code({ children, className }: any) {
    if (!className) return null
    const language = className.replace(/language-/, "")
    return (
      <PrismHighlight
        {...defaultProps}
        theme={undefined}
        code={children.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </PrismHighlight>
    )
  }

  function theme() {
    return createTheme({
      ...defaultTheme,
      typography: {
        fontSize: 14,
        h1: {
          fontWeight: 500
        }
      }
    })
  }

  function useStyles() {
    return makeStyles(theme =>
      createStyles({
        DocsEditThis: {
          position: "absolute",
          top: theme.spacing(1)
        },
        DocsBox: {
          fontSize: 16,
          "& h1": {
            fontSize: 28
          },
          "& h1, & h2": {
            color: defaultTheme.palette.primary.main
          },
          "& h1, & h2, & h3, & h4, & h5": {
            fontWeight: 400
          },
          "& em": {
            opacity: 0.5
          },
          "& code": {
            padding: "0.1em 0.2em",
            backgroundColor: defaultTheme.palette.background.default,
            border: "1px solid #e6eaf0",
            borderRadius: "0.3rem",
            color: defaultTheme.palette.primary.main
          },
          "& pre": {
            fontSize: 14
          },
          "& .language-shell": {
            background: "#e2e6f1"
          }
        },
        DocsPagination: {
          marginTop: theme.spacing(3),
          padding: theme.spacing(1),
          backgroundColor: "#EDF1F7",
          border: "1px solid #EEE",
          borderRadius: "0.3rem",
          "& span": {
            color: "#666",
            fontSize: 16
          },
          "& h5": {
            color: "#333",
            fontSize: 18,
            marginTop: theme.spacing(2),
            marginBottom: 0,
            fontWeight: 600
          }
        }
      })
    )()
  }
}

type PaginationData = {
  title: string
  uri: string
}

type PaginationType = {
  previous?: PaginationData
  next?: PaginationData
}
