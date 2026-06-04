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

export default async function deleteSer({
  t,
  SchemaName,
  oldData
}: Props<any>) {
  const token = await storedToken()

  const res = await request(`/${SchemaName}/${oldData.id}`, {
    prefix: ENV.AUTH_URL,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (res.error) {
    await notice({
      title: t("Delete Failed"),
      severity: "warning",
      content: JSON.stringify(oldData)
    })
  } else {
    await notice({
      title: t("Deleted"),
      severity: "success"
    })
  }

  return res
}
