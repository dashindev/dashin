import { EditableCtrl, ENV, request, notice } from "@xbuilder/bunadmin"
import { awHeaders, docPath } from "./awConfig"

interface Props<RowData> extends EditableCtrl {
  newData: RowData
}

export default async function addSer({ t, SchemaName, newData }: Props<any>) {
  const res = await request(docPath(SchemaName), {
    prefix: ENV.AUTH_URL,
    method: "POST",
    headers: await awHeaders(),
    // Appwrite create wraps fields under documentId + data
    data: { documentId: "unique()", data: newData }
  })

  if (res.code && res.code >= 400) {
    await notice({ title: t("Create Failed"), severity: "warning", content: res })
  } else {
    await notice({ title: t("Created"), severity: "success" })
  }

  return res
}
