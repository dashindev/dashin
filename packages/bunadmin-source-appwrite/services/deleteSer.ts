import { EditableCtrl, ENV, request, notice } from "@xbuilder/bunadmin"
import { awHeaders, docPath } from "./awConfig"

interface Props<RowData> extends EditableCtrl {
  oldData: RowData
}

export default async function deleteSer({ t, SchemaName, oldData }: Props<any>) {
  const res = await request(docPath(SchemaName, oldData.$id || oldData.id), {
    prefix: ENV.AUTH_URL,
    method: "DELETE",
    headers: await awHeaders()
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
