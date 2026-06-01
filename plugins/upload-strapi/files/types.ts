import { IFile } from "../utils/types/file"
import { IUser } from "@dashin-dev/auth-strapi"

export default interface Type extends IFile {
  created_at: string
  updated_at: string
  created_by: IUser
}
