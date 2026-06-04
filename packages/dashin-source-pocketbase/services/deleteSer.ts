import {
  EditableCtrl,
  ENV,
  request,
  storedToken,
  notice
} from "@dashin-dev/dashin"

interface Props<RowData> extends EditableCtrl {
  oldData: RowData
}

export default async function deleteSer({ t, SchemaName, oldData }: Props<any>) {
  const token = await storedToken()

  const res = await request(
    `/api/collections/${SchemaName}/records/${oldData.id}`,
    {
      prefix: ENV.AUTH_URL,
      method: "DELETE",
      headers: token ? { Authorization: token } : {}
    }
  )

  if (res && res.code && res.code >= 400) {
    await notice({
      title: t("Delete Failed"),
      severity: "warning",
      content: JSON.stringify(oldData)
    })
  } else {
    await notice({ title: t("Deleted"), severity: "success" })
  }

  return res
}
