export default interface Type {
  id: string
  created_at: number
  updated_at: number
  name: string
  parent_category?: {
    id: number
    name: string
  }
  sub_categories?: {
    id: number
    name: string
  }
}
