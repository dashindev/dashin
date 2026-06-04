export interface Type {
  username: string
  updated_at: number
  token: string
  role: string
  details?: string
  display_name?: string
  roles?: [keyof string]
}
