import { EditableCtrl, EditableDataType } from "@xbuilder/bunadmin"
import updateSer from "../services/updateSer"
import deleteSer from "../services/deleteSer"
import addSer from "../services/addSer"
import bulkUpdateSer from "../services/bulkUpdateSer"

export default function editableCtrl({
  t,
  SchemaName,
  disableAdd
}: EditableCtrl): EditableDataType<any> {
  return {
    onRowAdd: disableAdd
      ? undefined
      : async newData => await addSer({ t, SchemaName, newData }),
    onRowUpdate: async (newData, oldData) =>
      await updateSer({ t, SchemaName, newData, oldData }),
    onBulkUpdate: async changes =>
      await bulkUpdateSer({ t, SchemaName, changes }),
    onRowDelete: async oldData => await deleteSer({ t, SchemaName, oldData })
  }
}
