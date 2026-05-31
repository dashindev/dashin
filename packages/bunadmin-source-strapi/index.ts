import { Query } from "@xbuilder/bunadmin"

export interface DataCtrl extends EditableCtrl {
  query: Query<any>
}

export interface EditableCtrl {
  SchemaName: string
}

export * from "./services"
export * from "./controllers"
