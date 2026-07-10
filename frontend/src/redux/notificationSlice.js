import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  unreadCount: 0,
  connectionStatus: 'disconnected',
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    connectionChanged(state, action) {
      state.connectionStatus = action.payload
    },
    pushNotification: {
      reducer(state, action) {
        state.items.unshift(action.payload)
        state.items = state.items.slice(0, 12)
        state.unreadCount += 1
      },
      prepare(notification) {
        return {
          payload: {
            id: notification.id || nanoid(),
            type: notification.type || 'system',
            title: notification.title || 'Notification',
            message: notification.message || '',
            interaction: notification.interaction || null,
            metadata: notification.metadata || {},
            createdAt: notification.created_at || notification.createdAt || new Date().toISOString(),
            read: false,
          },
        }
      },
    },
    markAllRead(state) {
      state.items = state.items.map((item) => ({ ...item, read: true }))
      state.unreadCount = 0
    },
    clearNotifications(state) {
      state.items = []
      state.unreadCount = 0
    },
  },
})

export const { connectionChanged, pushNotification, markAllRead, clearNotifications } =
  notificationSlice.actions

export default notificationSlice.reducer
