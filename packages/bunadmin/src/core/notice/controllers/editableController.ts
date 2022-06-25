import { EditableDataType } from "@/components/Table/models/types"
import { Type } from "../types"
import { Primary } from "../schema"
import { BA_DB } from "@/utils/database"

type Props = { queryList: () => Promise<void> }
export function editableController({
  queryList
}: Props): EditableDataType<Type> {
  const primary = Primary

  return {
    onRowDelete: async oldData => {
      try {
        const db = BA_DB
        const query = db.notifications.where(primary).equals(oldData[primary])

        await query.delete()
        await queryList()
      } catch (e) {
        console.error(e)
      }
    }
  }
}
