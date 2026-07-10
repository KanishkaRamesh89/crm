import { useEffect, useMemo, useRef } from 'react'
import { FiSend, FiStar, FiTrash2 } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import Button from './Button'
import ChatMessage from './ChatMessage'
import { addMessage, clearChat, setInput, setTyping, submitChatMessage } from '../redux/chatSlice'
import { loadDashboard, loadInteractions, setFormValue } from '../redux/interactionSlice'

const buildContextText = (context) => {
  if (!context) {
    return ''
  }
  if (typeof context === 'string') {
    return context.trim()
  }

  const lines = []
  if (context.doctorName) lines.push(`Doctor: ${context.doctorName}`)
  if (context.hospital) lines.push(`Hospital: ${context.hospital}`)
  if (context.specialization) lines.push(`Specialization: ${context.specialization}`)
  if (context.visitDate) lines.push(`Visit date: ${context.visitDate}`)
  if (context.purpose) lines.push(`Purpose: ${context.purpose}`)
  if (context.followUpDate) lines.push(`Follow-up date: ${context.followUpDate}`)
  if (context.status) lines.push(`Status: ${context.status}`)
  if (context.discussion) lines.push(`Discussion: ${context.discussion}`)
  if (context.summary) lines.push(`Summary: ${context.summary}`)
  return lines.join('\n').trim()
}

const applyDraftToForm = (dispatch, draft) => {
  if (!draft) {
    return
  }

  const updates = [
    ['doctorName', draft.doctorName ?? draft.doctor_name],
    ['hospital', draft.hospital],
    ['specialization', draft.specialization],
    ['visitDate', draft.visitDate ?? draft.visit_date],
    ['purpose', draft.purpose],
    ['discussion', draft.discussion],
    ['summary', draft.summary],
    ['followUpDate', draft.followUpDate ?? draft.follow_up_date],
    ['status', draft.status],
  ]

  updates.forEach(([field, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      dispatch(setFormValue({ field, value }))
    }
  })
}

export default function ChatBox({ context = null }) {
  const dispatch = useDispatch()
  const { messages, input, isTyping, status, error } = useSelector((state) => state.chat)
  const endRef = useRef(null)
  const contextText = useMemo(() => buildContextText(context), [context])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) {
      return
    }

    dispatch(addMessage('user', text))
    dispatch(setInput(''))
    dispatch(setTyping(true))

    try {
      const response = await dispatch(
        submitChatMessage({
          message: text,
          context: contextText || null,
        }),
      ).unwrap()
      dispatch(addMessage('assistant', response.reply))
      applyDraftToForm(dispatch, {
        ...response.interaction,
        ...response.entities,
        summary: response.entities?.summary ?? response.interaction?.summary ?? response.summary,
      })
      if (response.interaction) {
        dispatch(loadInteractions())
        dispatch(loadDashboard())
      }
    } catch (err) {
      dispatch(addMessage('assistant', err || 'Unable to reach the AI service right now.'))
    } finally {
      dispatch(setTyping(false))
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            <FiStar />
            AI Assistant
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FiTrash2 />}
            onClick={() => dispatch(clearChat())}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 py-4">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length > 0 ? (
            messages.map((message) => (
              <ChatMessage key={message.id} sender={message.sender} text={message.text} />
            ))
          ) : null}

          {isTyping ? (
            <div className="flex justify-start">
              <div className="rounded-[24px] rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  <FiStar />
                  Typing
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
            ) : null}

          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3">
        {error ? (
          <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-medium text-slate-700">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Describe interaction
            </span>
            <input
              value={input}
              onChange={(event) => dispatch(setInput(event.target.value))}
              placeholder="Example: Met Dr. Smith, discussed Product X efficacy, and agreed on a follow-up."
              className="h-12 w-full rounded-[18px] border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <Button size="md" onClick={sendMessage} leftIcon={<FiSend />} className="sm:min-w-28">
            Process
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          {status === 'loading'
            ? 'Sending message to the AI backend...'
            : 'Backend responses update the chat and database in real time.'}
        </p>
      </div>
    </div>
  )
}
