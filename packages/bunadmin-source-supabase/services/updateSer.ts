import { EditableCtrl, ENV, request, notice } from "@xbuilder/bunadmin"
import { sbHeaders, tablePath } from "./sbConfig"

interface Props<RowData> extends EditableCtrl {
  newData: RowData
  oldData: RowData
  primaryKey?: string
}

export default async function updateSer({
  t,
  SchemaName,
  newData,
  oldData,
  primaryKey = "id"
}: Props<any>) {
  const res = await request(tablePath(SchemaName), {
    prefix: ENV.MAIN_URL || ENV.AUTH_URL,
    method: "PATCH",
    headers: await sbHeaders({ Prefer: "return=representation" }),
    params: { [primaryKey]: `eq.${oldData[primaryKey]}` },
    data: newData
  })

  if (res && res.code && res.code >= 400) {
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
