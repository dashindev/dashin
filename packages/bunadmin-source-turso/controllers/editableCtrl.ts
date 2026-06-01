import { EditableCtrl, EditableDataType } from "@dashin-dev/dashin"
import { addSer, updateSer, deleteSer } from "../services/crud"
import { bulkUpdateSer } from "../services/bulk"

export default function editableCtrl({ t, SchemaName, disableAdd }: EditableCtrl): EditableDataType<any> {
  return {
    onRowAdd: disableAdd ? undefined : async newData => await addSer({ t, SchemaName, newData }),
    onRowUpdate: async (newData, oldData) => await updateSer({ t, SchemaName, newData, oldData }),
    onBulkUpdate: async changes => await bulkUpdateSer({ t, SchemaName, changes }),
    onRowDelete: async oldData => await deleteSer({ t, SchemaName, oldData })
  }
}
