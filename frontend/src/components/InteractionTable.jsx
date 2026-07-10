import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi'
import Button from './Button'

export default function InteractionTable({
  interactions,
  onView,
  onEdit,
  onDelete,
  compact = false,
}) {
  const hasActions = Boolean(onView || onEdit || onDelete)

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Doctor</th>
              <th className="px-5 py-4 font-semibold">Hospital</th>
              <th className="px-5 py-4 font-semibold">Visit Date</th>
              <th className="px-5 py-4 font-semibold">Summary</th>
              <th className="px-5 py-4 font-semibold">Follow Up</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              {!compact && hasActions ? <th className="px-5 py-4 font-semibold">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {interactions.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-slate-500" colSpan={hasActions && !compact ? 7 : 6}>
                  No interactions found.
                </td>
              </tr>
            ) : (
              interactions.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{item.doctorName}</div>
                    <div className="text-sm text-slate-500">{item.specialization}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.hospital}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.visitDate}</td>
                  <td className="px-5 py-4 text-sm leading-6 text-slate-600">
                    {item.discussion}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.followUpDate}</td>
                  <td className="px-5 py-4">
                    <span
                      className={[
                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700',
                      ].join(' ')}
                    >
                      {item.status}
                    </span>
                  </td>
                  {!compact && hasActions ? (
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {onView ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<FiEye />}
                            onClick={() => onView(item)}
                          >
                            View
                          </Button>
                        ) : null}
                        {onEdit ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEdit2 />}
                            onClick={() => onEdit(item)}
                          >
                            Edit
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<FiTrash2 />}
                            onClick={() => onDelete(item)}
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
