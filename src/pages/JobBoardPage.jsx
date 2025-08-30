// src/pages/JobBoardPage.jsx
import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'
import { Input, Textarea } from '../components/Input.jsx'

/** Visual spec per status (header bg, top bar, card accent, chip colors) */
const THEME = {
  wishlist: { title: 'WISHLIST', headerBg: 'bg-slate-200', topBar: 'bg-slate-500', accent: 'bg-slate-500', chip: 'bg-neutral-300 text-neutral-800' },
  applied: { title: 'APPLIED', headerBg: 'bg-blue-200', topBar: 'bg-blue-600', accent: 'bg-blue-600', chip: 'bg-blue-600 text-white' },
  interviewing: { title: 'INTERVIEWING', headerBg: 'bg-amber-200', topBar: 'bg-amber-500', accent: 'bg-amber-500', chip: 'bg-amber-500 text-white' },
  offer: { title: 'OFFER', headerBg: 'bg-emerald-200', topBar: 'bg-emerald-600', accent: 'bg-emerald-600', chip: 'bg-emerald-600 text-white' },
  rejected: { title: 'REJECTED', headerBg: 'bg-rose-200', topBar: 'bg-rose-500', accent: 'bg-rose-500', chip: 'bg-rose-600 text-white' },
}

const STATUSES = ['wishlist','applied','interviewing','offer','rejected']

export default function JobBoardPage() {
  const { state, updateJob, deleteJob, addJob, fetchJobs } = useApp() // ⬅️ uses addJob from context

  const grouped = useMemo(() => {
    console.log('Current jobs state:', state.jobs)
    const groupedJobs = {
      wishlist: state.jobs.filter(j=>j.status==='wishlist'),
      applied: state.jobs.filter(j=>j.status==='applied'),
      interviewing: state.jobs.filter(j=>j.status==='interviewing'),
      offer: state.jobs.filter(j=>j.status==='offer'),
      rejected: state.jobs.filter(j=>j.status==='rejected'),
    }
    console.log('Grouped jobs:', groupedJobs)
    return groupedJobs
  }, [state.jobs])

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) updateJob(id, { status: targetStatus })
  }

  // -------- Edit Modal State --------
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  // -------- Create Modal State --------
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // shared form fields (we reuse for edit/create)
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [url, setUrl] = useState('')
  const [salary, setSalary] = useState('')
  const [status, setStatus] = useState('wishlist')
  const [notes, setNotes] = useState('')

  // open edit with existing values
  const openEdit = (job) => {
    setEditing(job)
    setTitle(job.title || '')
    setCompany(job.company || '')
    setUrl(job.url || '')
    setSalary(job.salary || '')
    setStatus(job.status || 'wishlist')
    setNotes(job.summary || '')
    setIsEditOpen(true)
  }
  const closeEdit = () => { setIsEditOpen(false); setEditing(null) }

  // open create with placeholders
  const openCreate = () => {
    setEditing(null)
    setTitle('')
    setCompany('')
    setUrl('')
    setSalary('')
    setStatus('wishlist')
    setNotes('')
    setIsCreateOpen(true)
  }
  const closeCreate = () => setIsCreateOpen(false)

  const onUpdateJob = async (e) => {
    e.preventDefault()
    if (!editing) return
    await updateJob(editing.id, { title, company, url, salary, status, summary: notes })
    closeEdit()
  }

  const onAddJob = async (e) => {
    e.preventDefault()
    // minimal required: title, company; others optional
    await addJob({
      title, company, url, salary, status, summary: notes,
      updatedAt: new Date().toISOString().slice(0,10),
    })
    closeCreate()
  }

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // close modals on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (isEditOpen) closeEdit()
        if (isCreateOpen) closeCreate()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isEditOpen, isCreateOpen])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
          <p className="text-neutral-500">Track and manage your job applications</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800"
        >
          <span className="grid h-5 w-5 place-content-center rounded-md bg-white/10">＋</span>
          Add Job
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {STATUSES.map((key) => (
          <Column
            key={key}
            title={THEME[key].title}
            count={grouped[key].length}
            theme={THEME[key]}
            onDrop={(e) => handleDrop(e, key)}
          >
            {grouped[key].length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {grouped[key].map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    theme={THEME[job.status] || THEME.wishlist}
                    onEdit={() => openEdit(job)}
                    onDelete={() => deleteJob(job.id)}
                  />
                ))}
              </div>
            )}
          </Column>
        ))}
      </div>

      {/* Footer Tip */}
      <div className="mt-8 rounded-2xl bg-neutral-100 px-4 py-3 text-center text-neutral-600">
        💡 Tip: Click on job cards to edit them. Use the status dropdown to move jobs between columns.
      </div>

      {/* ---------- Edit Modal ---------- */}
      {isEditOpen && (
        <Modal onClose={closeEdit}>
          <Header title="Edit Job" subtitle="Update the job details below." onClose={closeEdit} />
          <JobForm
            mode="edit"
            title={title} setTitle={setTitle}
            company={company} setCompany={setCompany}
            url={url} setUrl={setUrl}
            salary={salary} setSalary={setSalary}
            status={status} setStatus={setStatus}
            notes={notes} setNotes={setNotes}
            onCancel={closeEdit}
            onSubmit={onUpdateJob}
          />
        </Modal>
      )}

      {/* ---------- Create Modal ---------- */}
      {isCreateOpen && (
        <Modal onClose={closeCreate}>
          <Header title="Add New Job" subtitle="Fill in the details for your new job application." onClose={closeCreate} />
          <JobForm
            mode="create"
            title={title} setTitle={setTitle} titlePlaceholder="e.g. Frontend Developer"
            company={company} setCompany={setCompany} companyPlaceholder="e.g. Tech Corp"
            url={url} setUrl={setUrl} urlPlaceholder="https://company.com/job-posting"
            salary={salary} setSalary={setSalary} salaryPlaceholder="e.g. $80,000 – $120,000"
            status={status} setStatus={setStatus}
            notes={notes} setNotes={setNotes} notesPlaceholder="Add any notes about this job..."
            onCancel={closeCreate}
            onSubmit={onAddJob}
            submitLabel="Add Job"
          />
        </Modal>
      )}
    </div>
  )
}

/* ===================== UI Bits ===================== */

function Column({ title, count, theme, onDrop, children }) {
  return (
    <section
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
      onDragOver={(e)=> e.preventDefault()}
      onDrop={onDrop}
    >
      <div className={`h-2 rounded-t-2xl ${theme.topBar}`} />
      <div className={`flex items-center justify-between px-4 py-3 ${theme.headerBg}`}>
        <div className="text-sm font-semibold tracking-wider text-neutral-900">{title}</div>
        <span className="rounded-lg bg-white/70 px-2 py-1 text-xs font-semibold text-neutral-700">{count}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <div className="grid h-[360px] place-content-center rounded-2xl border border-neutral-200 bg-white text-neutral-400">
      No jobs yet
    </div>
  )
}

function JobCard({ job, theme, onEdit, onDelete }) {
  return (
    <div
      className="relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
      draggable
      onDragStart={(e)=> e.dataTransfer.setData('text/plain', job.id)}
    >
      <span className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-full ${theme.accent}`} aria-hidden />

      {/* icon buttons */}
      <div className="absolute right-4 top-4 flex items-center gap-3 text-neutral-500">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Open link"
            className="rounded-md p-1 hover:text-neutral-800 hover:bg-neutral-100"
            onClick={(e)=> e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v7H3V3h7" />
            </svg>
          </a>
        )}
        <button aria-label="Edit job" onClick={(e)=> { e.stopPropagation(); onEdit(); }} className="rounded-md p-1 hover:text-neutral-800 hover:bg-neutral-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
        <button aria-label="Delete job" onClick={(e)=> { e.stopPropagation(); onDelete(); }} className="rounded-md p-1 hover:text-rose-700 hover:bg-rose-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div className="ml-3">
        <div className="mb-1 text-[15px] font-semibold text-neutral-900">{job.title}</div>
        <div className="text-sm text-neutral-600">{job.company}</div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${theme.chip}`}>
            {job.status.charAt(0).toUpperCase()+job.status.slice(1)}
          </span>
          {job.salary && (
            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800">
              {job.salary}
            </span>
          )}
        </div>

        {job.summary && <p className="mt-3 text-sm text-neutral-600">{job.summary}</p>}

        <div className="mt-4 border-t pt-2 text-sm text-neutral-400">
          Updated {job.updatedAt || '2024-01-09'}
        </div>
      </div>
    </div>
  )
}

/* ---------- Modal + Form components ---------- */

function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
          {children}
        </div>
      </div>
    </div>
  )
}

function Header({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-5">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
      <button aria-label="Close" onClick={onClose} className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function JobForm({
  mode = 'edit',
  title, setTitle, titlePlaceholder = '',
  company, setCompany, companyPlaceholder = '',
  url, setUrl, urlPlaceholder = '',
  salary, setSalary, salaryPlaceholder = '',
  status, setStatus,
  notes, setNotes, notesPlaceholder = '',
  onCancel, onSubmit, submitLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="px-6 pb-6 pt-2 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Input label="Job Title *" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder={titlePlaceholder} />
        <Input label="Company *" value={company} onChange={(e)=> setCompany(e.target.value)} placeholder={companyPlaceholder} className="bg-neutral-100" />
        <Input label="Job Link" type="url" value={url} onChange={(e)=> setUrl(e.target.value)} placeholder={urlPlaceholder} />
        <Input label="Salary" value={salary} onChange={(e)=> setSalary(e.target.value)} placeholder={salaryPlaceholder} className="bg-neutral-100" />

        <label className="block">
          <div className="mb-1.5 text-sm font-medium text-neutral-700">Status</div>
          <select
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-900"
            value={status}
            onChange={(e)=> setStatus(e.target.value)}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}
          </select>
        </label>

        <Textarea label="Notes" value={notes} onChange={(e)=> setNotes(e.target.value)} placeholder={notesPlaceholder} />
      </div>

      <div className="mt-2 flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-neutral-800 hover:bg-neutral-50">
          Cancel
        </button>
        <Button type="submit" className="px-4 py-2">
          {submitLabel || (mode === 'edit' ? 'Update Job' : 'Add Job')}
        </Button>
      </div>
    </form>
  )
}