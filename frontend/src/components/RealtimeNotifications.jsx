import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { connectionChanged, pushNotification } from '../redux/notificationSlice'
import { loadDashboard, loadInteractions } from '../redux/interactionSlice'

const buildSocketUrl = () => {
  const fallbackBase =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : 'http://localhost:8000'
  const baseUrl = new URL(import.meta.env.VITE_API_BASE_URL || fallbackBase)
  baseUrl.protocol = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  baseUrl.pathname = '/api/notifications/ws'
  baseUrl.search = ''
  baseUrl.hash = ''
  return baseUrl.toString()
}

export default function RealtimeNotifications() {
  const dispatch = useDispatch()
  const reconnectRef = useRef(null)
  const socketRef = useRef(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    const connect = () => {
      dispatch(connectionChanged('connecting'))

      const socket = new WebSocket(buildSocketUrl())
      socketRef.current = socket

      socket.onopen = () => {
        dispatch(connectionChanged('connected'))
      }

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          dispatch(pushNotification(payload))

          if (
            payload.type?.startsWith('interaction.') ||
            payload.type === 'chat.saved'
          ) {
            dispatch(loadInteractions())
            dispatch(loadDashboard())
          }
        } catch (error) {
          console.error('Failed to parse notification payload', error)
        }
      }

      socket.onerror = () => {
        dispatch(connectionChanged('error'))
      }

      socket.onclose = () => {
        dispatch(connectionChanged('disconnected'))
        if (!cancelledRef.current) {
          reconnectRef.current = window.setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      cancelledRef.current = true
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current)
      }
      socketRef.current?.close()
    }
  }, [dispatch])

  return null
}
