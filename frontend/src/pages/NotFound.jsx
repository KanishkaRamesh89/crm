import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The route you requested is not available in the CRM module.
        </p>
        <div className="mt-6 flex justify-center">
          <Button as={Link} to="/" className="no-underline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
