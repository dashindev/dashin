import { SETTING_NAMES, ENV } from "@/main"
import { BunadminDatabase } from "."

export default async function dxInitData(
  db: BunadminDatabase
): Promise<BunadminDatabase> {
  const settings = db.settings
  const findInitData = await settings
    .where("name")
    .equals(SETTING_NAMES.i18n_code)
    .first()

  if (findInitData) {
    // console.log(`initData: already exists`)

    return db
  } else {
    const initData = [
      {
        name: SETTING_NAMES.i18n_code,
        value: ENV.I18N_CODE
      },
      {
        name: "username", // username
        value: undefined
      },
      {
        name: SETTING_NAMES.role,
        value: undefined
      },
      {
        name: SETTING_NAMES.site_name,
        value: undefined
      },
      {
        name: SETTING_NAMES.theme,
        value: undefined
      }
    ]
    await settings.bulkAdd(initData)

    // console.log(`init data done`)

    return db
  }
}
