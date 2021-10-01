import { RxDatabase } from "rxdb"

interface Props {
  db: RxDatabase<any>
  collection: string
  name: string
  initFunc: () => Promise<void>
}

export default async function rxInitData({
  db,
  collection,
  name,
  initFunc
}: Props) {
  const setting = db[collection]
  const is_init = await setting.findOne({ selector: { name: { $eq: name } } }).exec()

  if (!!is_init) {
    /**
     * !!!DEBUG ONLY
     * Initialize data after refreshing
     */
    // await setting.remove()
    // return console.log(`DatabaseService: ${name} already exists`)
  } else {
    await initFunc()

    // set init status
    await setting.upsert({
      name: name,
      value: "done"
    })

    console.log(`DatabaseService: ${name} done`)

    return window.location.reload()
  }
}
