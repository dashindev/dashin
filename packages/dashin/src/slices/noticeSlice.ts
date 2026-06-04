import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@/utils/store"
import { SeverityType } from "@/core/notice/types"

interface NoticeState {
  title: string
  severity?: SeverityType | null
  content?: string
  key?: string | number
  showDrawer?: number // show drawer noticy list
}

const initialState: NoticeState = {
  title: "init-notice"
}

export const noticeSlice = createSlice({
  name: "notice",
  initialState,
  reducers: {
    setNotice: (state, action: PayloadAction<NoticeState>) => {
      state.title = action.payload.title
      state.severity = action.payload.severity
      state.content = action.payload.content
      state.key = action.payload.key || new Date().getTime() + Math.random()
      // reset showDrawer
      state.showDrawer = undefined
    },
    toggleNotifyDrawer: state => {
      state.showDrawer = state.showDrawer ? state.showDrawer + 1 : 1
    },
    resetNotifyDrawer: state => {
      state.showDrawer = undefined
    }
  }
})

export const {
  setNotice,
  toggleNotifyDrawer,
  resetNotifyDrawer
} = noticeSlice.actions

export const selectNotice = (state: RootState) => state.notice as NoticeState

export default noticeSlice.reducer
