import { SeverityType } from "../types"
import { Primary } from "../schema"
import { store } from "@/utils/store"
import { setNotice } from "@/slices/noticeSlice"
import { nanoid } from "nanoid"
import { BA_DB } from "@/utils/database"

const primary = Primary

interface Interface {
  title: string
  severity?: SeverityType | null
  content?: string | object
}

export default async function noticeController({
  title,
  severity,
  content
}: Interface) {
  const nanoId = nanoid(10)
  const created_at = { created_at: Date.now() }

  try {
    const db = BA_DB

    if (typeof content === "object") content = JSON.stringify(content)
    if (typeof content !== "string") {
      content = undefined
      // console.warn(typeof content, content)
    }

    const data = { title, severity: severity || "success", content }

    store.dispatch(
      setNotice({
        title: title,
        severity: severity,
        content: content
      })
    )

    await db.notifications.add({
      [primary]: nanoId,
      ...created_at,
      ...data
    })
  } catch (e) {
    console.error("notice error", e)
  }
}
