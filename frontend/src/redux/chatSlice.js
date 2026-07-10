import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { sendChatMessage } from '../services/api'

export const submitChatMessage = createAsyncThunk(
  'chat/submitMessage',
  async (payload, { rejectWithValue }) => {
    try {
      return await sendChatMessage(payload)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Chat request failed')
    }
  },
)

const initialState = {
  messages: [],
  input: '',
  isTyping: false,
  status: 'idle',
  error: null,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInput(state, action) {
      state.input = action.payload
    },
    addMessage: {
      reducer(state, action) {
        state.messages.push(action.payload)
      },
      prepare(sender, text) {
        return {
          payload: {
            id: nanoid(),
            sender,
            text,
          },
        }
      },
    },
    setTyping(state, action) {
      state.isTyping = action.payload
    },
    clearChat(state) {
      state.messages = []
      state.input = ''
      state.isTyping = false
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitChatMessage.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(submitChatMessage.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(submitChatMessage.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Chat request failed'
      })
  },
})

export const { setInput, addMessage, setTyping, clearChat } = chatSlice.actions

export default chatSlice.reducer
