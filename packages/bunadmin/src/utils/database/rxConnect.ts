import { addPouchPlugin, createRxDatabase, getRxStoragePouch, RxDatabase } from "rxdb"
import { rxCollections } from "./rxCollections"

addPouchPlugin(require("pouchdb-adapter-idb"))
addPouchPlugin(require("pouchdb-adapter-memory"))
addPouchPlugin(require("pouchdb-adapter-http")) //enable syncing over http

const adapter = process.env.NODE_ENV === "test" ? "memory" : "idb"

const _create = async () => {
  const db = await createRxDatabase({
    name: "bunadmin", // <- name
    storage: getRxStoragePouch(adapter), // <- storage-adapter
    password: "JUUFblX8pY9BeBs9RF68N7n", // <- password (optional)
    multiInstance: true, // <- multiInstance (optional, default: true)
    ignoreDuplicate: true
  })
  // console.log("DatabaseService: created database")

  // create collections
  for (let index = 0; index < rxCollections.length; index++) {
    const obj = rxCollections[index];
    await db.addCollections({
      [obj.name]: { schema: obj.schema }
    })
  }
  // console.log("DatabaseService: create collections")

  return db
}

export default async function rxDb() {
  return await _create()
}
