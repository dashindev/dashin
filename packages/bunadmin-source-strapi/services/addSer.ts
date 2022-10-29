import {
  EditableCtrl,
  ENV,
  request,
  storedToken,
  notice
} from "@xbuilder/bunadmin"

interface Props<RowData> extends EditableCtrl {
  newData: RowData
}

export default async function addSer({ t, SchemaName, newData }: Props<any>) {
  const token = await storedToken()

  const res = await request(`/${SchemaName}`, {
    prefix: ENV.AUTH_URL,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: newData
  })

  if (res.error) {
    await notice({
      title: t("Create Failed"),
      severity: "warning",
      content: JSON.stringify(newData)
    })
  } else {
    await notice({
      title: t("Created"),
      severity: "success"
    })
  }

  return res
}
