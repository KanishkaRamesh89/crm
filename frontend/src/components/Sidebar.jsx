import { FiClock, FiGrid, FiLogOut, FiX } from 'react-icons/fi'
import { MdOutlineLocalHospital } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/', icon: FiGrid, end: true },
  { label: 'Log Interaction', to: '/log', icon: MdOutlineLocalHospital },
  { label: 'History', to: '/history', icon: FiClock },
]

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={[
          'fixed inset-0 z-40 bg-slate-950/40 transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <MdOutlineLocalHospital className="text-2xl" />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                NovaMed
              </div>
              <div className="text-sm text-slate-500">AI-First CRM</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 md:hidden"
            aria-label="Close navigation"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        <button
          type="button"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </aside>
    </>
  )
}
