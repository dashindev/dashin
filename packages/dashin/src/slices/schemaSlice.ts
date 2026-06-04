import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@/utils/store"
import { Type } from "@/core/schema/types"

interface SchemaState extends Type {}

const initialState: SchemaState[] = []

export const schemaSlice = createSlice({
  name: "schema",
  initialState,
  reducers: {
    setSchema: (state, action: PayloadAction<SchemaState[]>) => {
      action.payload.map(item => {
        const existState = state.find(s => s.id === item.id)
        !existState && state.push(item)
      })
    }
  }
})

export const { setSchema } = schemaSlice.actions

export const selectSchema = (state: RootState) => state.schema

export default schemaSlice.reducer
