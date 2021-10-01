import { addPouchPlugin, createRxDatabase, getRxStoragePouch } from "rxdb"
import { BunadminCollection } from "../types"
import { rxCollections } from "./rxCollections"

addPouchPlugin(require("pouchdb-adapter-idb"))
addPouchPlugin(require("pouchdb-adapter-memory"))
addPouchPlugin(require("pouchdb-adapter-http")) //enable syncing over http

const adapter = process.env.NODE_ENV === "test" ? "memory" : "idb"

const _create = async (collections?: BunadminCollection[]) => {
  const db = await createRxDatabase({
    name: "bunadmin", // <- name
    storage: getRxStoragePouch(adapter), // <- storage-adapter
    password: "JUUFblX8pY9BeBs9RF68N7n", // <- password (optional)
    multiInstance: true, // <- multiInstance (optional, default: true)
    ignoreDuplicate: true
  })
  // console.log("DatabaseService: created database")

  // create collections
  const colArr = collections ? [...rxCollections, ...collections] : rxCollections
  for (let index = 0; index < colArr.length; index++) {
    const obj = colArr[index];
    await db.addCollections({
      [obj.name]: { schema: obj.schema }
    })
  }
  // console.log("DatabaseService: create collections")

  return db
}

export default async function rxDb(collections?: BunadminCollection[]) {
  return await _create(collections)
}
