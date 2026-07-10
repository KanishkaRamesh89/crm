import { useEffect, useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import InteractionTable from '../components/InteractionTable'
import Modal from '../components/Modal'
import { loadInteractions, removeInteractionAsync, loadDashboard } from '../redux/interactionSlice'

const pageSize = 4

export default function History() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, listStatus, error } = useSelector((state) => state.interactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [selectedInteraction, setSelectedInteraction] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    dispatch(loadInteractions())
  }, [dispatch])

  const filteredInteractions = useMemo(() => {
    return items.filter((interaction) => {
      const matchesSearch =
        `${interaction.doctorName} ${interaction.hospital} ${interaction.purpose} ${interaction.discussion} ${interaction.summary}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'All' ? true : interaction.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [items, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredInteractions.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageItems = filteredInteractions.slice((safePage - 1) * pageSize, safePage * pageSize)

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return
    }

    setActionError('')
    try {
      await dispatch(removeInteractionAsync(pendingDelete.id)).unwrap()
      dispatch(loadInteractions())
      dispatch(loadDashboard())
      setPendingDelete(null)
    } catch (err) {
      setActionError(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <Input
          label="Search"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value)
            setPage(1)
          }}
          placeholder="Search doctor, hospital, or summary"
          leftIcon={<FiSearch />}
        />
        <Input
          as="select"
          label="Filter by Status"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPage(1)
          }}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </Input>
      </div>

      {listStatus === 'loading' ? (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading interactions...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <InteractionTable
        interactions={pageItems}
        onView={(interaction) => setSelectedInteraction(interaction)}
        onEdit={(interaction) => navigate(`/edit/${interaction.id}`)}
        onDelete={(interaction) => setPendingDelete(interaction)}
      />

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing {filteredInteractions.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-
          {Math.min(safePage * pageSize, filteredInteractions.length)} of{' '}
          {filteredInteractions.length} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiChevronLeft />}
            disabled={safePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Prev
          </Button>
          <span className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            rightIcon={<FiChevronRight />}
            disabled={safePage === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(selectedInteraction)}
        title={selectedInteraction?.doctorName || ''}
        description={selectedInteraction?.hospital || ''}
        onClose={() => setSelectedInteraction(null)}
      >
        {selectedInteraction ? (
          <div className="space-y-4 text-sm text-slate-600">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Visit Date
                </div>
                <div className="mt-2 font-medium text-slate-900">
                  {selectedInteraction.visitDate}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Follow Up
                </div>
                <div className="mt-2 font-medium text-slate-900">
                  {selectedInteraction.followUpDate || 'Not scheduled'}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Specialization
                </div>
                <div className="mt-2 font-medium text-slate-900">
                  {selectedInteraction.specialization || 'Not set'}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </div>
                <div className="mt-2 font-medium text-slate-900">
                  {selectedInteraction.status}
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Purpose
              </div>
              <p className="mt-2 leading-6 text-slate-700">{selectedInteraction.purpose}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Discussion
              </div>
              <p className="mt-2 leading-6 text-slate-700">{selectedInteraction.discussion}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Summary
              </div>
              <p className="mt-2 leading-6 text-slate-700">{selectedInteraction.summary || 'No summary'}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedInteraction(null)}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete interaction?"
        description="This action removes the database record from the CRM table."
        onClose={() => setPendingDelete(null)}
      >
        <div className="space-y-3">
          {actionError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionError}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
