import { Query } from "@dashin-dev/dashin"

export type AtomoFieldType =
  | "string"
  | "text"
  | "number"
  | "boolean"
  | "datetime"
  | "select"
  | "relation"
  | "blocks"
  | "json"
  | "id"
  | "email"
  | "url"

export interface AtomoRelationshipMeta {
  type: "many_to_one" | "one_to_many" | "many_to_many" | string
  model: string
  foreignKey?: string
}

export interface AtomoFieldMeta {
  name: string
  type: AtomoFieldType | string
  optional?: boolean
  attributes?: string[]
  relationship?: AtomoRelationshipMeta
}

export interface AtomoModelMeta {
  tableName: string
  primaryKey: string
  fields: Record<string, AtomoFieldMeta>
  relationships?: Record<string, AtomoRelationshipMeta>
  access?: Record<string, any>
  ui?: {
    listView?: string[]
  }
  searchable?: string[]
}

export interface AtomoSchemaMeta {
  models: Record<string, AtomoModelMeta>
  config?: Record<string, any>
}

export interface AtomoClientConfig {
  baseUrl?: string
  token?: string
  fetch?: typeof fetch
}

export interface AtomoSharedProps {
  model: string
  t?: (key: string) => string
  baseUrl?: string
  formatError?: (err: unknown) => string
}

export interface AtomoDataCtrlProps<RowData extends object = any> extends AtomoSharedProps {
  tableQuery: Query<RowData>
  searchField?: string
}

export interface AtomoEditableCtrlProps extends AtomoSharedProps {
  idField?: string
}

export interface AtomoBulkDeleteCtrlProps extends AtomoSharedProps {
  tableRef: React.RefObject<any>
  idField?: string
}
