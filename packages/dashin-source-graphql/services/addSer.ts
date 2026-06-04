import {
  request,
  storedToken,
  ENV,
  dataToGql,
  EditableCtrl,
  notice
} from "@dashin-dev/dashin"

interface Props<RowData> extends EditableCtrl {
  newData: RowData
}

export default async function addSer({ newData, SchemaName, t }: Props<any>) {
  const token = await storedToken()
  const objects = dataToGql({ data: newData })

  const gql = `
    mutation MyMutation {
      __typename
      insert_${SchemaName}(objects: ${objects}) {
        affected_rows
      }
    }
  `

  const { errors } = await request("/graphql", {
    prefix: ENV.MAIN_URL,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: JSON.stringify({ query: gql })
  })

  if (errors) {
    await notice({
      title: t("Create Failed"),
      severity: "error",
      content: JSON.stringify({ errors, newData })
    })
  } else {
    await notice({
      title: t("Created"),
      severity: "success"
    })
  }
}
