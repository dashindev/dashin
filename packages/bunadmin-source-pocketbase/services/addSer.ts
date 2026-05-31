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

  const res = await request(`/api/collections/${SchemaName}/records`, {
    prefix: ENV.AUTH_URL,
    method: "POST",
    headers: token ? { Authorization: token } : {},
    data: newData
  })

  if (res.code && res.code >= 400) {
    await notice({ title: t("Create Failed"), severity: "warning", content: res })
  } else {
    await notice({ title: t("Created"), severity: "success" })
  }

  return res
}
