import { ENV } from "../../config"
import Dexie from "dexie"

export const BA_STORE_TABLES = {
  // tables
  settings: "name",
  users: "id, username",
  notifications: "id"
}

export class BunadminDatabase extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  settings!: Dexie.Table<ISetting, string> // number = type of the primkey
  users!: Dexie.Table<IUser, string>
  notifications!: Dexie.Table<INotification, string>

  constructor() {
    super(ENV.DB_NAME)
    this.version(1).stores(BA_STORE_TABLES)
  }
}

export interface ISetting {
  name: string
  value?: string
  updated_at?: number
}

export interface IUser {
  id: string
  username: string
  updated_at: number
  role: string
  token: string
  details?: string
}

export interface INotification {
  id: string
  title: string
  severity: "success" | "info" | "warning" | "error"
  content?: string
  created_at: number
}

export const BA_DB = new BunadminDatabase()
export * from "./dxInitData"
export { default as Dexie } from "dexie"
