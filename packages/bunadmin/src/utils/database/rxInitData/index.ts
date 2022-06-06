import { BunadminCollection } from "@/utils/types"
import { RxDatabase } from "rxdb"
import rxDb from "../rxConnect"

interface Props {
  db: RxDatabase<any>
  collection: string
  name: string
  collections?: BunadminCollection[]
  initFunc: () => Promise<void>
}

export default async function rxInitData({
  db,
  collection,
  name,
  initFunc,
  collections
}: Props) {
  const setting = db[collection]
  const is_init = await setting.findOne({ selector: { name: { $eq: name } } }).exec()

  if (is_init) {
    // console.log(`DatabaseService: ${name} already exists`)
    return db
  } else {
    await initFunc()

    // set init status
    await setting.upsert({
      name: name,
      value: "done"
    })

    // console.log(`DatabaseService: ${name} done`)

    return await rxDb(collections)
  }
}
