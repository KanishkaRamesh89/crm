import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const detail = error.response?.data?.detail
    const message = Array.isArray(detail)
      ? detail
          .map((item) => item?.msg || item?.message || item?.error || JSON.stringify(item))
          .join(', ')
      : typeof detail === 'object' && detail !== null
        ? JSON.stringify(detail)
        : detail ||
          error.response?.data?.message ||
          error.message ||
          'Request failed'
    return Promise.reject(new Error(message))
  },
)

export const toClientInteraction = (item) => ({
  id: String(item.id),
  doctorName: item.doctor_name,
  hospital: item.hospital,
  specialization: item.specialization ?? '',
  visitDate: item.visit_date,
  purpose: item.purpose,
  discussion: item.discussion,
  summary: item.summary ?? '',
  followUpDate: item.follow_up_date ?? '',
  status: item.status,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
})

const toServerInteraction = (payload) => ({
  doctor_name: payload.doctorName,
  hospital: payload.hospital,
  specialization: payload.specialization || null,
  visit_date: payload.visitDate || null,
  purpose: payload.purpose,
  discussion: payload.discussion,
  summary: payload.summary || null,
  follow_up_date: payload.followUpDate || null,
  status: payload.status || 'Pending',
})

const toClientDashboard = (payload) => ({
  totalInteractions: payload.total_interactions,
  todaysInteractions: {
    count: payload.todays_interactions?.count ?? 0,
    items: (payload.todays_interactions?.items ?? []).map(toClientInteraction),
  },
  pendingFollowUps: {
    count: payload.pending_follow_ups?.count ?? 0,
    items: (payload.pending_follow_ups?.items ?? []).map(toClientInteraction),
  },
  completedVisits: {
    count: payload.completed_visits?.count ?? 0,
    items: (payload.completed_visits?.items ?? []).map(toClientInteraction),
  },
  recentInteractions: (payload.recent_interactions ?? []).map(toClientInteraction),
})

const toClientChatResponse = (payload) => ({
  reply: payload.reply,
  intent: payload.intent,
  tool: payload.tool,
  entities: payload.entities ?? null,
  summary: payload.summary ?? null,
  interaction: payload.interaction ? toClientInteraction(payload.interaction) : null,
})

export const fetchDashboardSummary = async () => {
  const response = await apiClient.get('/api/dashboard')
  return toClientDashboard(response)
}

export const fetchInteractions = async (params = {}) => {
  const response = await apiClient.get('/api/interactions', { params })
  return response.map(toClientInteraction)
}

export const fetchInteraction = async (id) => {
  const response = await apiClient.get(`/api/interactions/${id}`)
  return toClientInteraction(response)
}

export const createInteraction = async (payload) => {
  const response = await apiClient.post('/api/interactions', toServerInteraction(payload))
  return toClientInteraction(response)
}

export const updateInteractionRequest = async (id, payload) => {
  const response = await apiClient.put(
    `/api/interactions/${id}`,
    toServerInteraction(payload),
  )
  return toClientInteraction(response)
}

export const deleteInteractionRequest = async (id) => {
  await apiClient.delete(`/api/interactions/${id}`)
  return id
}

export const sendChatMessage = async (payload) => {
  const response = await apiClient.post('/api/chat', {
    message: payload.message,
    interaction_id: payload.interactionId ?? null,
    context: payload.context ?? null,
  })
  return toClientChatResponse(response)
}
