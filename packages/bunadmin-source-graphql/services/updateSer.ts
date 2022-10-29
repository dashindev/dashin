import {
  request,
  storedToken,
  ENV,
  dataToGql,
  EditableCtrl,
  notice
} from "@xbuilder/bunadmin"

interface Props<RowData> extends EditableCtrl {
  newData: RowData
  oldData: RowData
}

export default async function updateSer({
  t,
  SchemaName,
  primaryKey = "id",
  newData,
  oldData
}: Props<any>) {
  const token = await storedToken()
  const objects = dataToGql({ data: newData })

  const gql = `
    mutation MyMutation {
      __typename
      update_${SchemaName}(where: {${primaryKey}: {_eq: "${oldData.id}"}}, _set: ${objects}) {
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
      title: t("Save Failed"),
      severity: "error",
      content: JSON.stringify({ errors, newData })
    })
  } else {
    await notice({
      title: t("Changes Saved"),
      severity: "success"
    })
  }

  return res
}
