import {
  EditableCtrl,
  ENV,
  request,
  storedToken,
  notice
} from "@dashin-dev/dashin"

interface Props<RowData> extends EditableCtrl {
  newData: RowData
  oldData: RowData
}

export default async function updateSer({
  t,
  SchemaName,
  newData,
  oldData
}: Props<any>) {
  const token = await storedToken()

  const res = await request(`/${SchemaName}/${oldData.id}`, {
    prefix: ENV.AUTH_URL,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { data: newData.attributes }
  })

  if (res.error) {
    await notice({
      title: t("Save Failed"),
      severity: "warning",
      content: JSON.stringify({ errors: res, newData })
    })
  } else {
    await notice({
      title: t("Changes Saved"),
      severity: "success"
    })
  }

  return res
}
