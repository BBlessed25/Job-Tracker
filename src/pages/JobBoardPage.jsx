import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'
import Modal from '../components/Modal.jsx'
import JobColumn from '../components/JobColumn.jsx'
import { Input, Textarea } from '../components/Input.jsx'

const STATUS = ['wishlist','applied','interviewing','offer','rejected']
const STATUS_LABEL = { wishlist:'Wishlist', applied:'Applied', interviewing:'Interviewing', offer:'Offer', rejected:'Rejected' }

export default function JobBoardPage(){
  const { state, addJob, updateJob, deleteJob } = useApp()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const grouped = useMemo(()=> STATUS.reduce((acc, s)=> ({...acc, [s]: state.jobs.filter(j=>j.status===s)}), {}), [state.jobs])

  function handleDrop(id, to){
    if (to === '_DELETE_') return deleteJob(id)
    const job = state.jobs.find(j=>j.id===id)
    if (job && job.status !== to) updateJob(id, { status: to })
    if (job && job.status === to) setEditing(job)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Board</h1>
        <Button onClick={()=>{ setEditing(null); setOpen(true) }}>+ Add Job</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {STATUS.map((s)=> (
          <JobColumn key={s} status={s} jobs={grouped[s]} onDropJob={handleDrop}/>
        ))}
      </div>

      <JobModal open={open} onClose={()=>setOpen(false)} onSave={async (data)=>{ await addJob(data); setOpen(false) }}/>
      {editing && (
        <JobModal open={!!editing} initial={editing} onClose={()=>setEditing(null)} onSave={async (data)=>{ await updateJob(editing.id, data); setEditing(null) }}/>
      )}
    </div>
  )
}

function JobModal({ open, onClose, onSave, initial }){
  const [form, setForm] = useState(initial || { status:'wishlist' })
  const isEdit = Boolean(initial)
  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Job' : 'Add New Job'}>
      <div className="space-y-4">
        <Input label="Job Title *" placeholder="e.g. Frontend Developer" value={form.title || ''} onChange={(e)=> setForm({ ...form, title:e.target.value })} />
        <Input label="Company *" placeholder="e.g. Tech Corp" value={form.company || ''} onChange={(e)=> setForm({ ...form, company:e.target.value })} />
        <Input label="Job Link" placeholder="https://company.com/job-posting" value={form.link || ''} onChange={(e)=> setForm({ ...form, link:e.target.value })} />
        <Input label="Salary" placeholder="e.g. $80,000 - $120,000" value={form.salary || ''} onChange={(e)=> setForm({ ...form, salary:e.target.value })} />
        <label className="block">
          <div className="mb-1.5 text-sm font-medium text-neutral-700">Status</div>
          <select className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            value={form.status} onChange={(e)=> setForm({ ...form, status:e.target.value })}>
            {STATUS.map((s)=> <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
        <Textarea label="Notes" placeholder="Add any notes about this job..." value={form.notes || ''} onChange={(e)=> setForm({ ...form, notes:e.target.value })} />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={()=> onSave(form)}>{isEdit ? 'Save Changes' : 'Add Job'}</Button>
      </div>
    </Modal>
  )
}
