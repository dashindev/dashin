import { EditableCtrl, request, notice } from "@dashin-dev/dashin"
import { plHeaders, apiPath, apiBase } from "./plConfig"
import { errMessage } from "./errors"

interface Add<R> extends EditableCtrl { newData: R }
interface Upd<R> extends EditableCtrl { newData: R; oldData: R; primaryKey?: string }
interface Del<R> extends EditableCtrl { oldData: R; primaryKey?: string }

export function assertPayloadSuccess(res: any, fallback = "Operation failed"): void {
  // Allow null/undefined responses for successful 2xx responses with no body (e.g. HTTP 204 No Content on delete)
  if (res == null) {
    return
  }
  if (typeof res === "object") {
    if (Array.isArray(res.errors) && res.errors.length > 0) {
      const msg = errMessage(res, fallback)
      const err = new Error(msg) as any
      err.data = res
      throw err
    }
    if (res.success === false || res.ok === false) {
      const msg = res.message || res.error || errMessage(res, fallback)
      const err = new Error(msg) as any
      err.data = res
      throw err
    }
  }
}

export async function addSer({ t, SchemaName, newData }: Add<any>) {
  try {
    const res = await request(apiPath(SchemaName), {
      prefix: apiBase(), method: "POST", headers: await plHeaders(), data: newData, checkBusinessErrors: true
    } as any)
    assertPayloadSuccess(res, t("Create Failed"))
    await notice({ title: t("Created"), severity: "success" })
    return res
  } catch (err: any) {
    const msg = errMessage(err, t("Create Failed"))
    await notice({ title: t("Create Failed"), severity: "warning", content: msg })
    throw err
  }
}

export async function updateSer({ t, SchemaName, newData, oldData, primaryKey = "id" }: Upd<any>) {
  try {
    const res = await request(apiPath(SchemaName, oldData[primaryKey]), {
      prefix: apiBase(), method: "PATCH", headers: await plHeaders(), data: newData, checkBusinessErrors: true
    } as any)
    assertPayloadSuccess(res, t("Save Failed"))
    await notice({ title: t("Changes Saved"), severity: "success" })
    return res
  } catch (err: any) {
    const msg = errMessage(err, t("Save Failed"))
    await notice({ title: t("Save Failed"), severity: "warning", content: msg })
    throw err
  }
}

export async function deleteSer({ t, SchemaName, oldData, primaryKey = "id" }: Del<any>) {
  try {
    const res = await request(apiPath(SchemaName, oldData[primaryKey]), {
      prefix: apiBase(), method: "DELETE", headers: await plHeaders(), checkBusinessErrors: true
    } as any)
    assertPayloadSuccess(res, t("Delete Failed"))
    await notice({ title: t("Deleted"), severity: "success" })
    return res
  } catch (err: any) {
    const msg = errMessage(err, t("Delete Failed"))
    await notice({ title: t("Delete Failed"), severity: "warning", content: msg })
    throw err
  }
}
