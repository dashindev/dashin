import { createSlice } from "@reduxjs/toolkit"
import { PayloadAction } from "@reduxjs/toolkit"
import { Dispatch, AnyAction } from "redux"
import { useDispatch, useSelector } from "react-redux"

interface LayoutState {
  user: {
    username: string
    [k: string]: string
  }
  isSignedIn: boolean
}

const initialState: LayoutState = {
  user: {
    username: ""
  },
  isSignedIn: false
}

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<LayoutState["user"]>) {
      state.user = action.payload
      if (action.payload.username) {
        state.isSignedIn = true
      }
    },
    signOut(state, _action: PayloadAction<undefined>) {
      state.user = initialState.user
      state.isSignedIn = false
    }
  }
})

const { signIn, signOut } = layoutSlice.actions

const selectState = (state: { layout: LayoutState }) => state.layout

const useAppDispatch = () => useDispatch<Dispatch<AnyAction>>()

export const useLayoutReducer = () => {
  const dispatch = useAppDispatch()
  const layoutState = useSelector(selectState)

  return {
    ...layoutState,

    signIn: (user: Parameters<typeof signIn>[0]) => dispatch(signIn(user)),
    signOut: () => dispatch(signOut())
  }
}

export default layoutSlice.reducer
