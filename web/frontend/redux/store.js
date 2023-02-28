import { configureStore } from '@reduxjs/toolkit'
import toastReducer from './toastRedux.js'
export const store = configureStore({
    reducer: {
        toast: toastReducer,
      },
})