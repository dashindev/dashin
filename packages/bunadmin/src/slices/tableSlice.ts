import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@/utils/store"
import { Filter } from "@/components/Table/models/material-table-shim"

export interface TableFilter {
  filterField?: string
  filterOperator?: string
  column?: Filter<any>["column"]
  operator?: Filter<any>["operator"]
  value?: Filter<any>["value"]
}

export interface TableState {
  filters?: TableFilter[]
}

const initialState: TableState = {
  filters: []
}

export const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTable: (state, action: PayloadAction<TableState>) => {
      state.filters = action.payload.filters
    }
  }
})

export const { setTable } = tableSlice.actions

export const selectTable = (state: RootState) => state.table

export default tableSlice.reducer
