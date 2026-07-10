import { useEffect } from 'react'
import {
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPlusCircle,
} from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import InteractionTable from '../components/InteractionTable'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { loadDashboard } from '../redux/interactionSlice'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { dashboard, dashboardStatus, error } = useSelector((state) => state.interactions)

  const todaysInteractions = dashboard?.todaysInteractions?.items || []
  const pendingFollowUps = dashboard?.pendingFollowUps?.items || []
  const completedVisits = dashboard?.completedVisits?.items || []
  const recentInteractions = dashboard?.recentInteractions || []

  useEffect(() => {
    dispatch(loadDashboard())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Monitor field activity, upcoming follow-ups, and recent HCP interactions from one clean workspace."
      >
        <Button variant="secondary" leftIcon={<FiCalendar />} onClick={() => navigate('/history')}>
          View History
        </Button>
        <Button leftIcon={<FiPlusCircle />} onClick={() => navigate('/log')}>
          Log Interaction
        </Button>
      </PageHeader>

      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white shadow-lg shadow-blue-600/10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Welcome back, field team
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Keep every HCP conversation organized, compliant, and actionable.
          </h2>
        </div>
      </div>

      {dashboardStatus === 'loading' ? (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading dashboard data...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Interactions"
          value={dashboard?.totalInteractions ?? recentInteractions.length}
          description="All recorded HCP touches"
          icon={<FiBarChart2 className="text-xl" />}
        />
        <StatCard
          title="Today's Interactions"
          value={dashboard?.todaysInteractions?.count ?? todaysInteractions.length}
          description="Logged for the current day"
          icon={<FiCalendar className="text-xl" />}
          tone="sky"
        />
        <StatCard
          title="Pending Follow Ups"
          value={dashboard?.pendingFollowUps?.count ?? pendingFollowUps.length}
          description="Needs a next step"
          icon={<FiClock className="text-xl" />}
          tone="amber"
        />
        <StatCard
          title="Completed Visits"
          value={dashboard?.completedVisits?.count ?? completedVisits.length}
          description="Closed and documented"
          icon={<FiCheckCircle className="text-xl" />}
          tone="emerald"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Today's Interactions</h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {todaysInteractions.length} Today
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {todaysInteractions.slice(0, 3).map((interaction) => (
              <div key={interaction.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{interaction.doctorName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {interaction.hospital} · {interaction.specialization}
                </p>
                <p className="mt-2 text-sm text-slate-600">{interaction.purpose}</p>
              </div>
            ))}
            {todaysInteractions.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No interactions are scheduled for today.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Pending Follow Ups</h3>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {pendingFollowUps.length} Pending
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {pendingFollowUps.slice(0, 3).map((interaction) => (
              <div key={interaction.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{interaction.doctorName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Follow-up by {interaction.followUpDate}
                </p>
                <p className="mt-2 text-sm text-slate-600">{interaction.discussion}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Completed Visits</h3>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {completedVisits.length} Complete
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {completedVisits.slice(0, 3).map((interaction) => (
              <div key={interaction.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{interaction.doctorName}</p>
                <p className="mt-1 text-sm text-slate-500">{interaction.hospital}</p>
                <p className="mt-2 text-sm text-slate-600">{interaction.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-slate-500">
              Move quickly to the most common CRM workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/log')}>New Interaction</Button>
            <Button variant="secondary" onClick={() => navigate('/history')}>
              Open History
            </Button>
            <Button variant="ghost" onClick={() => navigate('/history')}>
              Review Follow-ups
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Recent Interactions</h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest HCP visits captured in the PostgreSQL dataset.
            </p>
          </div>
        </div>
        <InteractionTable
          interactions={recentInteractions.slice(0, 5)}
          onEdit={(interaction) => navigate(`/edit/${interaction.id}`)}
        />
      </div>
    </div>
  )
}
