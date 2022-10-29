import { IFile } from "@xbuilder/bunadmin-upload-strapi"
import ICategory from "../category/types"

export default interface Type {
  id: string
  created_at: number
  updated_at: number
  status: string
  user_id: boolean
  name: string
  content: string
  category: ICategory
  cover: IFile
  albums: IFile[]
}
