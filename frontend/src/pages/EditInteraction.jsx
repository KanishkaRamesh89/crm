import { useEffect, useState } from 'react'
import { FiSave, FiX } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import PageHeader from '../components/PageHeader'
import {
  loadInteractions,
  loadDashboard,
  loadInteractionById,
  updateInteractionAsync,
} from '../redux/interactionSlice'

function EditForm({ interaction }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form, setForm] = useState(() => ({ ...interaction }))
  const [message, setMessage] = useState('')
  const mutationStatus = useSelector((state) => state.interactions.mutationStatus)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      await dispatch(updateInteractionAsync({ id: interaction.id, payload: form })).unwrap()
      dispatch(loadInteractions())
      dispatch(loadDashboard())
      navigate('/history')
    } catch (error) {
      setMessage(error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Doctor Name" value={form.doctorName} onChange={updateField('doctorName')} />
        <Input label="Hospital" value={form.hospital} onChange={updateField('hospital')} />
        <Input
          label="Specialization"
          value={form.specialization}
          onChange={updateField('specialization')}
        />
        <Input
          label="Visit Date"
          type="date"
          value={form.visitDate}
          onChange={updateField('visitDate')}
        />
        <Input label="Purpose" value={form.purpose} onChange={updateField('purpose')} />
        <Input
          label="Follow Up Date"
          type="date"
          value={form.followUpDate}
          onChange={updateField('followUpDate')}
        />
        <div className="md:col-span-2">
          <Input
            as="textarea"
            label="Summary"
            value={form.summary}
            onChange={updateField('summary')}
          />
        </div>
        <div className="md:col-span-2">
          <Input
            as="textarea"
            label="Discussion"
            value={form.discussion}
            onChange={updateField('discussion')}
          />
        </div>
        <div className="md:col-span-2">
          <Input as="select" label="Status" value={form.status} onChange={updateField('status')}>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </Input>
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>
      ) : null}

      {mutationStatus === 'loading' ? (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Updating interaction...
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" leftIcon={<FiSave />}>
          Update
        </Button>
        <Button variant="secondary" leftIcon={<FiX />} onClick={() => navigate('/history')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function EditInteraction() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentInteraction, detailStatus } = useSelector((state) => state.interactions)

  useEffect(() => {
    dispatch(loadInteractionById(id))
  }, [dispatch, id])

  if (detailStatus === 'loading' && !currentInteraction) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <PageHeader
          title="Loading interaction"
          description="Fetching the selected record from PostgreSQL."
        />
      </div>
    )
  }

  if (!currentInteraction || String(currentInteraction.id) !== String(id)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <PageHeader
          title="Interaction not found"
          description="The requested record does not exist in the database."
        />
        <Button onClick={() => navigate('/history')}>Back to History</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Interaction"
        description="Update the pre-filled HCP record and keep the database in sync."
      />
      <EditForm key={currentInteraction.id} interaction={currentInteraction} />
    </div>
  )
}
