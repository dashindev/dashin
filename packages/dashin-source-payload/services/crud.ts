import { EditableCtrl, request, notice } from "@dashin-dev/dashin"
import { plHeaders, apiPath, apiBase } from "./plConfig"

interface Add<R> extends EditableCtrl { newData: R }
interface Upd<R> extends EditableCtrl { newData: R; oldData: R; primaryKey?: string }
interface Del<R> extends EditableCtrl { oldData: R; primaryKey?: string }

export async function addSer({ t, SchemaName, newData }: Add<any>) {
  const res = await request(apiPath(SchemaName), {
    prefix: apiBase(), method: "POST", headers: await plHeaders(), data: newData
  })
  await notice(
    res && res.errors
      ? { title: t("Create Failed"), severity: "warning", content: res }
      : { title: t("Created"), severity: "success" }
  )
  return res
}

export async function updateSer({ t, SchemaName, newData, oldData, primaryKey = "id" }: Upd<any>) {
  const res = await request(apiPath(SchemaName, oldData[primaryKey]), {
    prefix: apiBase(), method: "PATCH", headers: await plHeaders(), data: newData
  })
  await notice(
    res && res.errors
      ? { title: t("Save Failed"), severity: "warning", content: JSON.stringify({ errors: res, newData }) }
      : { title: t("Changes Saved"), severity: "success" }
  )
  return res
}

export async function deleteSer({ t, SchemaName, oldData, primaryKey = "id" }: Del<any>) {
  const res = await request(apiPath(SchemaName, oldData[primaryKey]), {
    prefix: apiBase(), method: "DELETE", headers: await plHeaders()
  })
  await notice(
    res && res.errors
      ? { title: t("Delete Failed"), severity: "warning", content: JSON.stringify(oldData) }
      : { title: t("Deleted"), severity: "success" }
  )
  return res
}
