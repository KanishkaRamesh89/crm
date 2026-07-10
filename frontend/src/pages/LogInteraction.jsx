import { useState } from 'react'
import { FiAlertCircle, FiPlusCircle, FiSave, FiTrash2 } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import ChatBox from '../components/ChatBox'
import Input from '../components/Input'
import { createInteractionAsync, loadDashboard, resetForm, setFormValue } from '../redux/interactionSlice'

const fieldCard =
  'rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]'

export default function LogInteraction() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const form = useSelector((state) => state.interactions.form)
  const mutationStatus = useSelector((state) => state.interactions.mutationStatus)
  const [message, setMessage] = useState('')

  const updateField = (field) => (event) => {
    dispatch(setFormValue({ field, value: event.target.value }))
  }

  const handleClear = () => {
    dispatch(resetForm())
    setMessage('')
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (!form.doctorName || !form.hospital || !form.visitDate || !form.purpose) {
      setMessage('Please fill the required fields before saving the interaction.')
      return
    }

    setMessage('')
    try {
      await dispatch(createInteractionAsync(form)).unwrap()
      dispatch(loadDashboard())
      dispatch(resetForm())
      navigate('/history')
    } catch (error) {
      setMessage(error)
    }
  }

  return (
    <div className="h-[calc(100vh-9.5rem)] min-h-[640px]">
      <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-5 lg:p-5">
          <form
            onSubmit={handleSave}
            className={`${fieldCard} flex min-h-0 flex-col overflow-hidden`}
          >
            <div className="mb-4 border-b border-slate-200 pb-3">
              <h2 className="text-xl font-semibold text-slate-900 xl:text-2xl">
                Interaction Details
              </h2>
              <p className="mt-1 text-xs text-slate-500 xl:text-sm">
                Fill the structured fields, then use the assistant on the right to refine the note.
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 xl:space-y-5">
              <section className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2 xl:gap-4">
                  <Input
                    label="HCP Name"
                    value={form.doctorName}
                    onChange={updateField('doctorName')}
                    placeholder="Dr. Smith"
                  />
                  <Input
                    label="Hospital"
                    value={form.hospital}
                    onChange={updateField('hospital')}
                    placeholder="City Hospital"
                  />
                  <Input
                    label="Specialization"
                    value={form.specialization}
                    onChange={updateField('specialization')}
                    placeholder="Cardiology"
                  />
                  <Input
                    label="Visit Date"
                    type="date"
                    value={form.visitDate}
                    onChange={updateField('visitDate')}
                  />
                </div>
              </section>

              <section className="space-y-3 rounded-[24px] border border-slate-100 bg-slate-50/80 p-3 xl:p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 xl:text-sm">
                  <FiAlertCircle className="text-blue-600" />
                  Visit Notes
                </div>
                <div className="grid gap-3 xl:gap-4">
                  <Input
                    label="Purpose"
                    value={form.purpose}
                    onChange={updateField('purpose')}
                    placeholder="Quarterly review, product discussion, sample drop"
                  />
                  <Input
                    as="textarea"
                    label="Discussion"
                    value={form.discussion}
                    onChange={updateField('discussion')}
                    placeholder="Summarize the conversation, concerns raised, and any commitments made."
                  />
                  <Input
                    as="textarea"
                    label="Summary"
                    value={form.summary}
                    onChange={updateField('summary')}
                    placeholder="Write a short CRM-ready summary for the interaction."
                  />
                </div>
              </section>

              <section className="grid gap-3 md:grid-cols-2 xl:gap-4">
                <Input
                  label="Follow Up Date"
                  type="date"
                  value={form.followUpDate}
                  onChange={updateField('followUpDate')}
                />
                <Input
                  as="select"
                  label="Status"
                  value={form.status}
                  onChange={updateField('status')}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </Input>
              </section>

            </div>

            {message ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 xl:px-4 xl:py-3 xl:text-sm">
                {message}
              </div>
            ) : null}

            {mutationStatus === 'loading' ? (
              <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700 xl:px-4 xl:py-3 xl:text-sm">
                Saving interaction...
              </div>
            ) : null}

            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row">
              <Button type="submit" leftIcon={<FiSave />} className="sm:min-w-40">
                Save Interaction
              </Button>
              <Button variant="secondary" leftIcon={<FiTrash2 />} onClick={handleClear}>
                Clear Form
              </Button>
            </div>
          </form>

          <div className="h-full min-h-0 self-start lg:sticky lg:top-24">
            <ChatBox context={form} />
          </div>
        </div>
      </div>
    </div>
  )
}
