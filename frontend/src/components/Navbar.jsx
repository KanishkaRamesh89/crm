import { useEffect, useRef, useState } from 'react'
import { FiBell, FiMenu } from 'react-icons/fi'
import { FaUserCircle } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { markAllRead } from '../redux/notificationSlice'

const formatTime = (value) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))

export default function Navbar({ title, onMenuClick }) {
  const dispatch = useDispatch()
  const { items, unreadCount, connectionStatus } = useSelector((state) => state.notifications)
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleToggleNotifications = () => {
    setIsOpen((current) => {
      const next = !current
      if (next) {
        dispatch(markAllRead())
      }
      return next
    })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label="Open navigation"
          >
            <FiMenu className="text-xl" />
          </button>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              NovaMed CRM
            </div>
            <div className="text-lg font-semibold text-slate-900">{title}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              <FiBell className="text-lg" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>

            {isOpen ? (
              <div className="absolute right-0 top-12 w-[22rem] rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/60">
                <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Live Activity</div>
                    <div className="text-xs text-slate-500">
                      {connectionStatus === 'connected'
                        ? 'Connected to real-time events'
                        : connectionStatus === 'connecting'
                          ? 'Connecting to live events...'
                          : 'Live feed offline'}
                    </div>
                  </div>
                  <span
                    className={[
                      'rounded-full px-2 py-1 text-[11px] font-semibold',
                      connectionStatus === 'connected'
                        ? 'bg-emerald-50 text-emerald-700'
                        : connectionStatus === 'connecting'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    {connectionStatus}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto px-1 py-2">
                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className={[
                            'rounded-2xl border px-3 py-3',
                            item.read
                              ? 'border-slate-100 bg-slate-50'
                              : 'border-blue-100 bg-blue-50',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                              <div className="mt-1 text-sm leading-5 text-slate-600">
                                {item.message}
                              </div>
                            </div>
                            <span className="whitespace-nowrap text-[11px] text-slate-400">
                              {formatTime(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500">
                      No live notifications yet.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-900">HCP Support</div>
              <div className="text-xs text-slate-500">Healthcare CRM</div>
            </div>
            <FaUserCircle className="text-3xl text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
