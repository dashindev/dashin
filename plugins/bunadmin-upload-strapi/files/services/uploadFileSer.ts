import request from "umi-request"
import { BunadminFileType, ENV, storedToken } from "@dashin-dev/dashin"
import { IFile } from "../../utils/types/file"

type Resp = IFile[]

type Options = {
  url?: string
  prefix?: string
  method?: string
  headers?: any
}

export default async function uploadFileSer(
  data: any,
  options?: Options,
  existedFile?: BunadminFileType
): Promise<Resp> {
  const token = await storedToken()

  let prefix = (options && options.prefix) || ENV.MAIN_URL
  if (prefix) prefix = prefix.replace("/api/v1", "")

  const url = !existedFile
    ? (options && options.url) || "/upload"
    : (options && options.url) || `/upload/?id=${existedFile.id}`

  // `upload request` use `umi-request` directly
  return await request(url, {
    prefix: prefix,
    method: (options && options.method) || "post",
    headers: (options && options.headers) || {
      Authorization: `Bearer ${token}`
    },
    data: data
  })
}
