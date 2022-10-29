import {
  request,
  storedToken,
  ENV,
  EditableCtrl,
  notice
} from "@xbuilder/bunadmin"

interface Props<RowData> extends EditableCtrl {
  oldData: RowData
}

export default async function deleteSer({
  t,
  SchemaName,
  primaryKey = "id",
  oldData
}: Props<any>) {
  const token = await storedToken()

  const gql = `
    mutation MyMutation {
      __typename
      delete_${SchemaName}(where: {${primaryKey}: {_eq: "${oldData.id}"}}) {
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

  const { errors } = res

  if (errors) {
    await notice({
      title: t("Delete Failed"),
      severity: "error",
      content: JSON.stringify({ errors })
    })
  } else {
    await notice({
      title: t("Deleted"),
      severity: "success"
    })
  }

  return res
}
