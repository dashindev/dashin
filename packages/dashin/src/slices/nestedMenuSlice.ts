import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@/utils/store"
import { Type } from "@/core/menu/types"

interface NestedMenuState extends Type {}

const initialState: NestedMenuState[] = []

export const nestedMenuSlice = createSlice({
  name: "nestedMenu",
  initialState,
  reducers: {
    setNestedMenu: (state, action: PayloadAction<NestedMenuState[]>) => {
      action.payload.map(item => {
        const existState = state.find(s => s.id === item.id)
        !existState && state.push(item)
      })
    }
  }
})

export const { setNestedMenu } = nestedMenuSlice.actions

export const selectNestedMenu = (state: RootState) => state.nestedMenu

export default nestedMenuSlice.reducer
