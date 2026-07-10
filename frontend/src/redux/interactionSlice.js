import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createInteraction,
  deleteInteractionRequest,
  fetchDashboardSummary,
  fetchInteraction,
  fetchInteractions,
  updateInteractionRequest,
} from '../services/api'

const blankForm = {
  doctorName: '',
  hospital: '',
  specialization: '',
  visitDate: '',
  purpose: '',
  discussion: '',
  summary: '',
  followUpDate: '',
  status: 'Pending',
}

const normalizeError = (error) =>
  error instanceof Error ? error.message : 'Something went wrong'

export const loadInteractions = createAsyncThunk(
  'interactions/loadInteractions',
  async (params, { rejectWithValue }) => {
    try {
      return await fetchInteractions(params)
    } catch (error) {
      return rejectWithValue(normalizeError(error))
    }
  },
)

export const loadInteractionById = createAsyncThunk(
  'interactions/loadInteractionById',
  async (id, { rejectWithValue }) => {
    try {
      return await fetchInteraction(id)
    } catch (error) {
      return rejectWithValue(normalizeError(error))
    }
  },
)

export const loadDashboard = createAsyncThunk(
  'interactions/loadDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchDashboardSummary()
    } catch (error) {
      return rejectWithValue(normalizeError(error))
    }
  },
)

export const createInteractionAsync = createAsyncThunk(
  'interactions/createInteraction',
  async (payload, { rejectWithValue }) => {
    try {
      return await createInteraction(payload)
    } catch (error) {
      return rejectWithValue(normalizeError(error))
    }
  },
)

export const updateInteractionAsync = createAsyncThunk(
  'interactions/updateInteraction',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateInteractionRequest(id, payload)
    } catch (error) {
      return rejectWithValue(normalizeError(error))
    }
  },
)

export const removeInteractionAsync = createAsyncThunk(
  'interactions/removeInteraction',
  async (id, { rejectWithValue }) => {
    try {
      return await deleteInteractionRequest(id)
    } catch (error) {
      return rejectWithValue(normalizeError(error))
    }
  },
)

const initialState = {
  items: [],
  currentInteraction: null,
  dashboard: null,
  form: { ...blankForm },
  listStatus: 'idle',
  detailStatus: 'idle',
  dashboardStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
}

const interactionSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    setFormValue(state, action) {
      const { field, value } = action.payload
      state.form[field] = value
    },
    resetForm(state) {
      state.form = { ...blankForm }
    },
    setFormFromInteraction(state, action) {
      const interaction =
        state.items.find((item) => item.id === action.payload) || state.currentInteraction

      if (interaction) {
        state.form = {
          doctorName: interaction.doctorName,
          hospital: interaction.hospital,
          specialization: interaction.specialization || '',
          visitDate: interaction.visitDate || '',
          purpose: interaction.purpose,
          discussion: interaction.discussion,
          summary: interaction.summary || '',
          followUpDate: interaction.followUpDate || '',
          status: interaction.status || 'Pending',
        }
      }
    },
    clearCurrentInteraction(state) {
      state.currentInteraction = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInteractions.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(loadInteractions.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload
      })
      .addCase(loadInteractions.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload || 'Unable to load interactions'
      })
      .addCase(loadInteractionById.pending, (state) => {
        state.detailStatus = 'loading'
        state.error = null
      })
      .addCase(loadInteractionById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.currentInteraction = action.payload

        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        } else {
          state.items.unshift(action.payload)
        }
      })
      .addCase(loadInteractionById.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = action.payload || 'Unable to load interaction'
      })
      .addCase(loadDashboard.pending, (state) => {
        state.dashboardStatus = 'loading'
        state.error = null
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.dashboardStatus = 'succeeded'
        state.dashboard = action.payload
      })
      .addCase(loadDashboard.rejected, (state, action) => {
        state.dashboardStatus = 'failed'
        state.error = action.payload || 'Unable to load dashboard'
      })
      .addCase(createInteractionAsync.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(createInteractionAsync.fulfilled, (state, action) => {
      state.mutationStatus = 'succeeded'
      state.items.unshift(action.payload)
      state.currentInteraction = action.payload
      state.form = { ...blankForm }
      })
      .addCase(createInteractionAsync.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload || 'Unable to create interaction'
      })
      .addCase(updateInteractionAsync.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(updateInteractionAsync.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.currentInteraction = action.payload
      })
      .addCase(updateInteractionAsync.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload || 'Unable to update interaction'
      })
      .addCase(removeInteractionAsync.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(removeInteractionAsync.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items = state.items.filter((item) => item.id !== String(action.payload))
        if (state.currentInteraction?.id === String(action.payload)) {
          state.currentInteraction = null
        }
      })
      .addCase(removeInteractionAsync.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload || 'Unable to delete interaction'
      })
  },
})

export const {
  setFormValue,
  resetForm,
  setFormFromInteraction,
  clearCurrentInteraction,
} = interactionSlice.actions

export default interactionSlice.reducer
