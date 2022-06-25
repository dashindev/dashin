import { Primary } from "@/core/auth/schema"
import { BA_DB, IUser } from "../database"

export default async function storedToken(): Promise<string | undefined>
export default async function storedToken(
  returnUser: true
): Promise<IUser | undefined>
export default async function storedToken(
  returnUser?: true
): Promise<string | IUser | undefined> {
  const db = BA_DB

  // query username from bunadmin_setting
  const settingRes = await db.settings
    .where("name")
    .equals(Primary)
    .first()
  const username = (settingRes && settingRes.value) || ""

  // query user from auth_store
  const localUser = await db.users
    .where(Primary)
    .equals(username)
    .first()

  if (returnUser) {
    return localUser
  } else {
    return localUser && localUser.token
  }
}
