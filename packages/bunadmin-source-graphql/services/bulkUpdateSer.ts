import {
  ENV,
  request,
  storedToken,
  notice,
  BulkUpdateProps
} from "@xbuilder/bunadmin"

export default async function bulkUpdateSer<T>({
  t,
  SchemaName,
  primaryKey = "id",
  changes
}: BulkUpdateProps<T>) {
  const token = await storedToken()

  const resList: any[] = []
  let successCount = 0
  let failCount = 0
  const changesList = Object.values(changes)

  for (let i = 0; i < changesList.length; i++) {
    const { oldData, newData } = changes[i]
    // @ts-ignore
    const _eqData = oldData[primaryKey]
    const gql = `
    mutation MyMutation {
      __typename
      update_${SchemaName}(where: {${primaryKey}: {_eq: "${_eqData}"}}, _set: ${newData}) {
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
        title: t("Save Failed"),
        severity: "error",
        content: JSON.stringify({ errors, newData })
      })
      failCount++
    } else {
      successCount++
    }

    if (i + 1 === changesList.length) {
      const successMsg = successCount > 0 ? `, ${successCount} success` : ""
      const failedMsg = failCount > 0 ? `, ${failCount} failure.` : ""
      await notice({
        title: t(`Batch Request Completed`),
        severity:
          successCount === changesList.length
            ? "success"
            : failCount === changesList.length
            ? "error"
            : "info",
        content: `${changesList.length} items ${successMsg}${failedMsg}`
      })
    }
  }

  return resList
}
