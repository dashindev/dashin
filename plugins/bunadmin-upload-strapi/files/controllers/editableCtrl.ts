import { EditableDataType } from "@dashin-dev/dashin"
// import addSer from "../services/addSer"
import updateSer from "../services/updateSer"
import deleteSer from "../services/deleteSer"

export default function editableCtrl(): EditableDataType<any> {
  return {
    // isEditable: rowData => rowData.not_editable === true, // only name(a) rows would be editable
    // isDeletable: rowData => rowData.not_deletable === true, // only name(a) rows would be deletable
    // onRowAdd: async newData => await addSer(newData),
    onRowUpdate: async (newData, oldData) => await updateSer(newData, oldData),
    onRowDelete: oldData => deleteSer(oldData)
  }
}
