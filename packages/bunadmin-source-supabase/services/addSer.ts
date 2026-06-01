import { EditableCtrl, ENV, request, notice } from "@xbuilder/bunadmin"
import { sbHeaders, tablePath } from "./sbConfig"

interface Props<RowData> extends EditableCtrl {
  newData: RowData
}

export default async function addSer({ t, SchemaName, newData }: Props<any>) {
  const res = await request(tablePath(SchemaName), {
    prefix: ENV.MAIN_URL || ENV.AUTH_URL,
    method: "POST",
    headers: await sbHeaders({ Prefer: "return=representation" }),
    data: newData
  })

  if (res && res.code && res.code >= 400) {
    await notice({ title: t("Create Failed"), severity: "warning", content: res })
  } else {
    await notice({ title: t("Created"), severity: "success" })
  }

  return res
}
