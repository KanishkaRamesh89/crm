import { configureStore } from '@reduxjs/toolkit'
import interactionReducer from './interactionSlice'
import chatReducer from './chatSlice'
import notificationReducer from './notificationSlice'

export const store = configureStore({
  reducer: {
    interactions: interactionReducer,
    chat: chatReducer,
    notifications: notificationReducer,
  },
})
