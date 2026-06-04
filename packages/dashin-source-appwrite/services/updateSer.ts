import { EditableCtrl, ENV, request, notice } from "@dashin-dev/dashin"
import { awHeaders, docPath } from "./awConfig"

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
  const res = await request(docPath(SchemaName, oldData.$id || oldData.id), {
    prefix: ENV.AUTH_URL,
    method: "PATCH",
    headers: await awHeaders(),
    data: { data: newData }
  })

  if (res.code && res.code >= 400) {
    await notice({
      title: t("Save Failed"),
      severity: "warning",
      content: JSON.stringify({ errors: res, newData })
    })
  } else {
    await notice({ title: t("Changes Saved"), severity: "success" })
  }

  return res
}
