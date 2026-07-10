import { useState } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import RealtimeNotifications from '../components/RealtimeNotifications'
import Sidebar from '../components/Sidebar'
import Dashboard from '../pages/Dashboard'
import EditInteraction from '../pages/EditInteraction'
import History from '../pages/History'
import LogInteraction from '../pages/LogInteraction'
import NotFound from '../pages/NotFound'

const titles = {
  '/': 'Dashboard',
  '/log': 'Log Interaction',
  '/history': 'Interaction History',
  '/edit': 'Edit Interaction',
}

function AppLayout() {
  const location = useLocation()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const title =
    Object.entries(titles).find(([path]) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path),
    )?.[1] || 'AI-First CRM'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <RealtimeNotifications />
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="md:pl-72">
        <Navbar
          title={title}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="log" element={<LogInteraction />} />
        <Route path="history" element={<History />} />
        <Route path="edit/:id" element={<EditInteraction />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
