import Type from "../types"
import { ENV, storedToken, notice } from "@dashin-dev/dashin"
import request from "umi-request"

export default async function updateSer(newData: Type, oldData: Type) {
  const token = await storedToken()

  const formData = new FormData()
  formData.append("fileInfo", JSON.stringify(newData))

  // "multipart/form-data" use `umi-request` directly
  const res = await request(`/upload?id=${oldData.id}`, {
    prefix: ENV.AUTH_URL,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: formData
  })

  if (res.error) {
    await notice({
      title: "Sorry, you can't update this file",
      severity: "warning",
      content: JSON.stringify(oldData)
    })
  } else {
    await notice({
      title: "Successful",
      severity: "success"
    })
  }
}
