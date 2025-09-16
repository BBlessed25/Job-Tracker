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

// Flex status transitions: allow moving a job to any status
const STATUS_RULES = null

export default function JobBoardPage() {
  const { state, updateJob, deleteJob, addJob, fetchJobs } = useApp() // ⬅️ uses addJob from context
  
  // Status validation messages
  const [statusError, setStatusError] = useState('')
  const [statusSuccess, setStatusSuccess] = useState('')
  const [cardStatusPrompt, setCardStatusPrompt] = useState({ jobId: null, type: null, message: '' })

  // Function to validate status change
  const validateStatusChange = () => true

  // Function to show status error (optionally for a specific job card)
  const showStatusError = (message, jobId) => {
    setStatusError(message)
    setStatusSuccess('')
    if (jobId) {
      setCardStatusPrompt({ jobId, type: 'error', message })
      setTimeout(() => setCardStatusPrompt({ jobId: null, type: null, message: '' }), 3000)
    }
    setTimeout(() => setStatusError(''), 3000)
  }

  // Function to show status success (optionally for a specific job card)
  const showStatusSuccess = (message, jobId) => {
    setStatusSuccess(message)
    setStatusError('')
    if (jobId) {
      setCardStatusPrompt({ jobId, type: 'success', message })
      setTimeout(() => setCardStatusPrompt({ jobId: null, type: null, message: '' }), 3000)
    }
    setTimeout(() => setStatusSuccess(''), 3000)
  }

  // Custom status change handler with validation
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
  }

  // Prevent duplicate active applications: same title+company where either existing
  // or new record has a non-rejected status. Allow duplicates only if the new
  // status is 'rejected'.
  const hasActiveDuplicate = (titleValue, companyValue, statusValue, excludeId = null) => {
    const normalizedTitle = (titleValue || '').trim().toLowerCase()
    const normalizedCompany = (companyValue || '').trim().toLowerCase()
    const targetStatus = (statusValue || 'wishlist').toLowerCase()
    if (targetStatus === 'rejected') return false
    const jobs = Array.isArray(state.jobs) ? state.jobs : []
    return jobs.some(j => {
      if (excludeId && j.id === excludeId) return false
      const jt = (j.title || '').trim().toLowerCase()
      const jc = (j.company || '').trim().toLowerCase()
      return jt === normalizedTitle && jc === normalizedCompany && (j.status || '').toLowerCase() !== 'rejected'
    })
  }

  const grouped = useMemo(() => {
    console.log('Current jobs state:', state.jobs)
    // Ensure state.jobs is an array to prevent errors
    const jobs = Array.isArray(state.jobs) ? state.jobs : []
    const groupedJobs = {
      wishlist: jobs.filter(j=>j.status==='wishlist'),
      applied: jobs.filter(j=>j.status==='applied'),
      interviewing: jobs.filter(j=>j.status==='interviewing'),
      offer: jobs.filter(j=>j.status==='offer'),
      rejected: jobs.filter(j=>j.status==='rejected'),
    }
    console.log('Grouped jobs:', groupedJobs)
    return groupedJobs
  }, [state.jobs])

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      // Find the job to get its current status
      const job = state.jobs.find(j => j.id === id)
      if (job) {
        const currentStatus = job.status
        console.log('Dropping job:', id, 'from', currentStatus, 'to status:', targetStatus)
        // If dropped into the same column, do nothing (no prompt)
        if (currentStatus === targetStatus) {
          return
        }

        // Flexible: allow status change via drag-and-drop
        updateJob(id, { status: targetStatus })
        showStatusSuccess('Status updated successfully', id)
      }
    }
  }

  // -------- Edit Modal State --------
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  // -------- Create Modal State --------
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // -------- Delete Confirmation (inline) --------
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // shared form fields (we reuse for edit/create)
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [url, setUrl] = useState('')
  const [salary, setSalary] = useState('')
  const [status, setStatus] = useState('wishlist')
  const [notes, setNotes] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [queuedPrompt, setQueuedPrompt] = useState(null)

  // open edit with existing values
  const openEdit = (job) => {
    setEditing(job)
    setTitle(job.title || '')
    setCompany(job.company || '')
    setUrl(job.url || '')
    setSalary(job.salary || '')
    setStatus(job.status || 'wishlist')
    setNotes(job.summary || '')
    setStatusError('')
    setStatusSuccess('')
    setEditSuccess('')
    setIsEditOpen(true)
  }
  const closeEdit = () => { 
    setIsEditOpen(false); 
    setEditing(null);
  }

  // open create with placeholders
  const openCreate = () => {
    setEditing(null)
    setTitle('')
    setCompany('')
    setUrl('')
    setSalary('')
    setStatus('wishlist')
    setNotes('')
    setStatusError('')
    setStatusSuccess('')
    setCreateSuccess('')
    setIsCreateOpen(true)
  }
  const closeCreate = () => setIsCreateOpen(false)

  // Inline delete confirmation handler
  const handleDeleteClick = async (job) => {
    if (confirmDeleteId === job.id) {
      try {
        await deleteJob(job.id)
      } catch (error) {
        console.error('Failed to delete job:', error)
      } finally {
        setConfirmDeleteId(null)
      }
    } else {
      setConfirmDeleteId(job.id)
    }
  }


  // Auto-dismiss delete confirmation prompt after 1.5s
  useEffect(() => {
    if (!confirmDeleteId) return
    const timerId = setTimeout(() => setConfirmDeleteId(null), 1500)
    return () => clearTimeout(timerId)
  }, [confirmDeleteId])


  const onUpdateJob = async (e) => {
    e.preventDefault()
    if (!editing) return
    
    // Flexible: do not restrict status changes
    // If nothing changed, show inline prompt and do nothing
    const origTitle = (editing.title || '').trim()
    const origCompany = (editing.company || '').trim()
    const origUrl = (editing.url || '').trim()
    const origSalary = (editing.salary || '').trim()
    const origStatus = (editing.status || 'wishlist').trim()
    const origNotes = (editing.summary || '').trim()
    const newTitle = (title || '').trim()
    const newCompany = (company || '').trim()
    const newUrl = (url || '').trim()
    const newSalary = (salary || '').trim()
    const newStatus = (status || 'wishlist').trim()
    const newNotes = (notes || '').trim()
    const noChanges =
      origTitle === newTitle &&
      origCompany === newCompany &&
      origUrl === newUrl &&
      origSalary === newSalary &&
      origStatus === newStatus &&
      origNotes === newNotes
    if (noChanges) {
      showStatusError('No new changes were made')
      return
    }
    // Prevent duplicate active applications (same company + role)
    if (hasActiveDuplicate(title, company, status, editing.id)) {
      showStatusError('Application exists for this company and job title')
      return
    }
    
    console.log('Updating job:', editing.id, 'with data:', { title, company, url, salary, status, summary: notes })
    
    // Optimistically show success prompt immediately
    setStatusError('')
    setEditSuccess('Status updated successfully')
    setTimeout(() => setEditSuccess(''), 3000)
    try {
      await updateJob(editing.id, { title, company, url, salary, status, summary: notes })
      console.log('Job updated successfully')
    } catch (error) {
      console.error('Failed to update job:', error)
      // Replace success with error if request fails
      setEditSuccess('')
      showStatusError('Failed to update job')
    }
  }

  const onAddJob = async (e) => {
    e.preventDefault()
    // Require title and company; show inline error if missing
    const t = (title || '').trim()
    const c = (company || '').trim()
    if (!t || !c) {
      showStatusError('Job title and company required')
      return
    }
    // minimal required: title, company; others optional
    if (hasActiveDuplicate(title, company, status)) {
      showStatusError('Application exists for this company and  job title.')
      return
    }
    // Optimistically show success in the modal footer-left
    setStatusError('')
    setCreateSuccess('Job added successfully')
    setTimeout(() => setCreateSuccess(''), 3000)
    try {
      await addJob({
        title, company, url, salary, status, summary: notes,
        updatedAt: new Date().toISOString().slice(0,10)
      })
      // Reset form fields (keep modal open for quick successive adds)
      setTitle('')
      setCompany('')
      setUrl('')
      setSalary('')
      setStatus('wishlist')
      setNotes('')
      // Auto-close the modal after 5 seconds
      try { setTimeout(() => { if (isCreateOpen) closeCreate() }, 5000) } catch {}
    } catch (err) {
      // Replace success with error if request fails
      setCreateSuccess('')
      showStatusError('Failed to add job')
    }
  }

  // (Modal-based delete removed in favor of inline confirmation)

  // Fetch jobs when component mounts and user is authenticated
  useEffect(() => {
    if (state.user && state.authStatus === 'authenticated' && state.jobsStatus === 'idle') {
      fetchJobs()
    }
  }, [state.user, state.authStatus, state.jobsStatus]) // Only fetch when needed

  // close modals on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (isEditOpen) closeEdit()
        if (isCreateOpen) closeCreate()
        if (confirmDeleteId) setConfirmDeleteId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isEditOpen, isCreateOpen, confirmDeleteId])

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:py-8 overflow-x-hidden">
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

      {/* Top-page status alerts removed in favor of inline prompts on cards and in modal */}

      {/* Not Authenticated State */}
      {state.authStatus !== 'authenticated' && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center">
          <div className="text-lg font-semibold text-blue-900">Please Log In</div>
          <div className="text-sm text-blue-700 mt-2">You need to be logged in to view and manage your jobs</div>
          <Link to="/login" className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      )}

      {/* Loading State */}
      {state.authStatus === 'authenticated' && state.jobsStatus === 'loading' && (
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <div className="text-lg font-semibold text-neutral-900">Loading jobs...</div>
          <div className="text-sm text-neutral-500">Please wait while we fetch your job applications</div>
        </div>
      )}

      {/* Error State */}
      {state.authStatus === 'authenticated' && state.error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="text-lg font-semibold text-rose-900">Error Loading Jobs</div>
          <div className="text-sm text-rose-700 mt-2">{state.error}</div>
          <button 
            onClick={() => fetchJobs()} 
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Responsive flex layout: wraps on small, five in a row on xl+ */}
      {state.jobsStatus !== 'loading' && !state.error && (
        <div className="flex flex-wrap xl:flex-nowrap gap-3 md:gap-x-6 xl:gap-6">
          {STATUSES.map((key) => (
            <div key={key} className="basis-full md:basis-[calc(50%-0.75rem)] xl:basis-1/5">
              <Column
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
                        onDelete={() => handleDeleteClick(job)}
                        showDeletePrompt={confirmDeleteId === job.id}
                        statusPrompt={cardStatusPrompt.jobId === job.id ? cardStatusPrompt : null}
                      />
                    ))}
                  </div>
                )}
              </Column>
            </div>
          ))}
        </div>
      )}

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
            status={status} setStatus={handleStatusChange}
            notes={notes} setNotes={setNotes}
            inlineStatusError={statusError}
            inlineStatusSuccess={editSuccess || statusSuccess}
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
            status={status} setStatus={handleStatusChange}
            notes={notes} setNotes={setNotes} notesPlaceholder="Add any notes about this job..."
            inlineStatusError={statusError}
            inlineStatusSuccess={createSuccess}
            onCancel={closeCreate}
            onSubmit={onAddJob}
            submitLabel="Add Job"
          />
        </Modal>
      )}

      {/* Inline delete confirmation handled within JobCard */}
    </div>
  )
}

/* ===================== UI Bits ===================== */

function Column({ title, count, theme, onDrop, children }) {
  return (
    <section
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm xl:h-[70vh] xl:flex xl:flex-col"
      onDragOver={(e)=> e.preventDefault()}
      onDrop={onDrop}
    >
      <div className={`h-2 rounded-t-2xl ${theme.topBar}`} />
      <div className={`flex items-center justify-between px-4 py-3 ${theme.headerBg}`}>
        <div className="text-sm font-semibold tracking-wider text-neutral-900">{title}</div>
        <span className="rounded-lg bg-white/70 px-2 py-1 text-xs font-semibold text-neutral-700">{count}</span>
      </div>
      <div className="p-4 xl:flex-1 xl:overflow-y-auto">
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

function JobCard({ job, theme, onEdit, onDelete, showDeletePrompt, statusPrompt }) {
  return (
    <div
      className="relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm overflow-hidden"
      draggable
      onDragStart={(e)=> {
        e.dataTransfer.setData('text/plain', job.id);
      }}
    >
      <span className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${theme.accent}`} aria-hidden />

      {/* Non-draggable button overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{ zIndex: 10 }}
      >
        <div 
          className="absolute right-2 top-2 flex items-center gap-2 text-neutral-500 pointer-events-auto"
          style={{ pointerEvents: 'auto' }}
        >
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
        <button 
          aria-label="Edit job" 
          onClick={() => {
            onEdit();
          }}
          className="rounded-md p-1 hover:text-neutral-800 hover:bg-neutral-100"
          style={{ 
            pointerEvents: 'auto',
            zIndex: 1000,
            position: 'relative'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
        <button 
          aria-label="Delete job" 
          onClick={() => {
            onDelete();
          }}
          className="rounded-md p-1 hover:text-rose-700 hover:bg-rose-50"
          style={{ 
            pointerEvents: 'auto',
            zIndex: 1000,
            position: 'relative'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
        </div>
      </div>

      <div className="ml-3 pr-16 sm:pr-20">
        <div className="mb-1 text-[15px] font-semibold text-neutral-900 break-words leading-tight">{job.title}</div>
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

        <div className="mt-4 border-t pt-2 text-sm text-neutral-400 flex items-center justify-between pr-4">
          <span>Updated {job.updatedAt || '2024-01-09'}</span>
          <span className="flex items-center gap-3">
            {statusPrompt && (
              <span className={statusPrompt.type === 'error' ? 'font-medium text-rose-600' : 'font-medium text-emerald-700'}>
                {statusPrompt.message}
              </span>
            )}
            {/* Delete confirmation prompt on extreme right */}
            {showDeletePrompt && (
              <span className="font-medium text-rose-600 ml-8">Confirm again to delete</span>
            )}
          </span>
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
        <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
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
  inlineStatusError,
  inlineStatusSuccess,
  onCancel, onSubmit, submitLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="px-5 pb-5 pt-1 space-y-3">
      <div className="grid grid-cols-1 gap-4">
        <Input label="Job Title *" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder={titlePlaceholder} className="py-2" />
        <Input label="Company *" value={company} onChange={(e)=> setCompany(e.target.value)} placeholder={companyPlaceholder} className="bg-neutral-100 py-2" />
        <Input label="Job Link" type="url" value={url} onChange={(e)=> setUrl(e.target.value)} placeholder={urlPlaceholder} className="py-2" />
        <Input label="Salary" value={salary} onChange={(e)=> setSalary(e.target.value)} placeholder={salaryPlaceholder} className="bg-neutral-100 py-2" />

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

        <Textarea label="Notes" value={notes} onChange={(e)=> setNotes(e.target.value)} placeholder={notesPlaceholder} rows={3} className="py-2" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 pr-4">
        <div className="text-sm">
          {inlineStatusError && (
            <span className="font-medium text-rose-600">{inlineStatusError}</span>
          )}
          {!inlineStatusError && inlineStatusSuccess && (
            <span className="font-medium text-emerald-700">{inlineStatusSuccess}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-neutral-800 hover:bg-neutral-50">
            Cancel
          </button>
          <button 
            type="submit" 
            className="inline-flex items-center justify-center font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none px-4 py-2 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            {submitLabel || (mode === 'edit' ? 'Update Job' : 'Add Job')}
          </button>
        </div>
      </div>
    </form>
  )
}