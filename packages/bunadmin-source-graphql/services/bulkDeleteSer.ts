import {
  ENV,
  request,
  storedToken,
  notice,
  BulkDeleteProps
} from "@dashin-dev/dashin"

type Props<RowData extends object> = BulkDeleteProps & {
  data: RowData[]
}

export default async function bulkDeleteSer<T extends object>({
  t,
  SchemaName,
  primaryKey = "id",
  data
}: Props<T>) {
  const token = await storedToken()

  const resList: any[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < data.length; i++) {
    // @ts-ignore
    const _eqData = data[i][primaryKey]
    const gql = `
    mutation MyMutation {
      __typename
      delete_${SchemaName}(where: {${primaryKey}: {_eq: "${_eqData}"}}) {
        affected_rows
      }
    }
  `

    const res = await request("/graphql", {
      prefix: ENV.MAIN_URL,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: JSON.stringify({ query: gql })
    })
    resList.push(resList)

    const { errors } = res

    if (errors) {
      await notice({
        title: t("Delete Failed"),
        severity: "error",
        content: JSON.stringify({ errors, data })
      })
      failCount++
    } else {
      successCount++
    }

    if (i + 1 === data.length) {
      const successMsg = successCount > 0 ? `, ${successCount} success` : ""
      const failedMsg = failCount > 0 ? `, ${failCount} failure.` : ""
      await notice({
        title: t(`Batch Request Completed`),
        severity:
          successCount === data.length
            ? "success"
            : failCount === data.length
            ? "error"
            : "info",
        content: `${data.length} items ${successMsg}${failedMsg}`
      })
    }
  }

  return resList
}
