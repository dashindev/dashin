import { EditableCtrl, ENV, request, notice } from "@dashin-dev/dashin"
import { sbHeaders, tablePath } from "./sbConfig"

interface Props<RowData> extends EditableCtrl {
  oldData: RowData
  primaryKey?: string
}

export default async function deleteSer({
  t,
  SchemaName,
  oldData,
  primaryKey = "id"
}: Props<any>) {
  const res = await request(tablePath(SchemaName), {
    prefix: ENV.MAIN_URL || ENV.AUTH_URL,
    method: "DELETE",
    headers: await sbHeaders(),
    params: { [primaryKey]: `eq.${oldData[primaryKey]}` }
  })

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
