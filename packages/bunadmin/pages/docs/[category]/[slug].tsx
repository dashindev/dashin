import React, { useEffect, useState } from "react"
import { Type } from "@/core/menu/types"
import dynamic from "next/dynamic"
import TableSkeleton from "@/components/Table/components/TableSkeleton"
import Head from "next/head"
import { MDXProvider } from "@mdx-js/react"
import { ParsedUrlQuery } from "querystring"
import { useRouter } from "next/router"
import { defaultTheme, DynamicDocRoute, ENV } from "@/utils"

import PrismHighlight, { defaultProps } from "prism-react-renderer"
import { EvaIcon } from "@dashin-dev/dashin"
import DefaultLayout from "@/private/DefaultLayout"
import Error from "@/private/Error"

const prismCss = "/assets/css/prism.css"

const REMOTE_BRANCH = "https://github.com/xbuilder/dashin/blob/master"

export default function DocsCategorySlug() {
  const router = useRouter()
  const { category, slug } = router.query as ParsedUrlQuery
  const [pagination, setPagination] = useState<PaginationType>({})
  const [menuData, setMenuData] = useState<Type[]>([])

  const dashinDocPath = "@dashin-dev/docs"

  useEffect(() => {
    ;(async () => {
      try {
        const content = await import(
          `../../../.dashin/dynamic/${dashinDocPath}/menus`
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
        `../../../../../plugins/${dashinDocPath}/${category}/${slug}.mdx`
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
      <DefaultLayout leftMenu={{ data: menuData, offLeftSetting: true }}>
        {slug ? (
          <div className="docs-box p-6 pt-2 text-base [&_code]:rounded [&_code]:border [&_code]:border-gray-200 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-primary [&_em]:opacity-50 [&_h1,&_h2]:text-primary [&_h1,&_h2,&_h3,&_h4,&_h5]:font-normal [&_h1]:text-[28px] [&_pre]:text-sm [&_.language-shell]:bg-[#e2e6f1]">
            <DocsHeader />
            <MDXProvider components={{ code: Code }}>
              <DocsComponent />
            </MDXProvider>
            <DocsPagination />
          </div>
        ) : (
          <Error statusCode={404} hasLayout={false} />
        )}
      </DefaultLayout>
    </>
  )

  function DocsHeader() {
    return (
      <div className="relative flex justify-end">
        <a
          href={
            REMOTE_BRANCH +
            `/plugins/${dashinDocPath}/${category}/${slug}.mdx`
          }
          target="_blank"
          rel="noopener nofollow"
          className="absolute top-2 text-sm text-primary hover:underline"
        >
          Edit this page
        </a>
      </div>
    )
  }

  function DocsPagination() {
    return (
      <div className="mt-6 flex justify-between rounded border border-gray-200 bg-[#EDF1F7] p-2">
        <a
          href="#"
          onClick={e => {
            e.preventDefault()
            pagePush(pagination.previous)
          }}
        >
          {pagination.previous ? (
            <div className="flex items-center">
              <EvaIcon
                name="arrow-ios-back-outline"
                size="xlarge"
                fill="gray"
              />
              <div className="ml-2">
                <span className="text-base text-gray-500">PREVIOUS</span>
                <h5 className="mb-0 mt-2 text-lg font-semibold text-gray-800">
                  {pagination.previous.title}
                </h5>
              </div>
            </div>
          ) : (
            <div />
          )}
        </a>
        {pagination.next && (
          <a
            href="#"
            onClick={e => {
              e.preventDefault()
              pagePush(pagination.next)
            }}
          >
            <div className="flex items-center">
              <div className="mr-2 text-right">
                <span className="text-base text-gray-500">NEXT</span>
                <h5 className="mb-0 mt-2 text-lg font-semibold text-gray-800">
                  {pagination.next.title}
                </h5>
              </div>
              <EvaIcon
                name="arrow-ios-forward-outline"
                size="xlarge"
                fill="gray"
              />
            </div>
          </a>
        )}
      </div>
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
}

type PaginationData = {
  title: string
  uri: string
}

type PaginationType = {
  previous?: PaginationData
  next?: PaginationData
}
