import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'

export default function DashboardPage(){
  const { state } = useApp()
  const location = useLocation()
  // Read the persisted just-signed-up flag for the first render after redirect
  const showWelcomeForNewSignup =
    state.justSignedUp ||
    (location.state && location.state.newSignup === true) ||
    (typeof window !== 'undefined' && sessionStorage.getItem('jt_justSignedUp') === '1')
  useEffect(()=>{
    if (showWelcomeForNewSignup) {
      try { sessionStorage.removeItem('jt_justSignedUp') } catch {}
    }
  }, [showWelcomeForNewSignup])
  const counts = useMemo(()=> ({
    wishlist: state.jobs.filter(j=>j.status==='wishlist').length,
    applied: state.jobs.filter(j=>j.status==='applied').length,
    interviewing: state.jobs.filter(j=>j.status==='interviewing').length,
    offer: state.jobs.filter(j=>j.status==='offer').length,
    rejected: state.jobs.filter(j=>j.status==='rejected').length,
  }), [state.jobs])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {showWelcomeForNewSignup ? (
            <>Hi, {state.user?.fullName || 'John Doe'} <span className="inline-block">👋</span></>
          ) : (
            <>Welcome back, {state.user?.fullName || 'John Doe'} <span className="inline-block">👋</span></>
          )}
        </h1>
        <p className="text-neutral-600">Here's your job search overview</p>
      </div>

      {/* Profile Information card */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-neutral-900 font-semibold">Profile Information</div>
            <div className="text-sm text-neutral-500">Your account details</div>
          </div>
          <Link to="/settings" className="text-neutral-400 hover:text-neutral-600">›</Link>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="grid h-14 w-14 place-content-center rounded-full bg-neutral-900 text-white text-lg font-semibold">
            {(state.user?.fullName || 'John Doe').split(' ').map(p=>p[0]).slice(0,2).join('') || 'J'}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-neutral-900">{state.user?.fullName || 'John Doe'}</div>
            <div className="text-sm text-neutral-500">{state.user?.email || 'frontend@gmail.com'}</div>
            
            {/* 🔹 Updated: now routes to SettingsPage */}
            <Link 
              to="/settings" 
              className="text-sm text-neutral-400 hover:text-neutral-600 none underline-offset-2"
            >
              Click to edit profile
            </Link>
          </div>
        </div>
      </div>

      {/* Job Search Statistics */}
      <h2 className="mb-3 text-2xl font-semibold">Job Search Statistics</h2>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total Jobs" value={state.jobs.length} dot="bg-blue-600" />
        <Stat label="Wishlist" value={counts.wishlist} dot="bg-neutral-400" />
        <Stat label="Applied" value={counts.applied} dot="bg-amber-500" />
        <Stat label="Interviewing" value={counts.interviewing} dot="bg-blue-600" />
        <Stat label="Offers" value={counts.offer} dot="bg-green-600" />
        <Stat label="Rejected" value={counts.rejected} dot="bg-rose-600" />
      </div>

      {/* Quick Actions */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-4">
          <div className="font-semibold text-neutral-900">Quick Actions</div>
          <div className="text-sm text-neutral-500">Jump into your job search</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link to="/board">
            <Button className="w-full py-3">Go to Job Board</Button>
          </Link>
          <Link to="/board#add">
            <button className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-700 hover:bg-neutral-50">
              Add New Job
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="px-4 pt-4">
          <div className="font-semibold text-neutral-900">Recent Applications</div>
          <div className="text-sm text-neutral-500">Your latest job applications</div>
        </div>
        <div className="mt-4 space-y-3">
          {state.jobs.slice(0,3).map((j)=> (
            <RecentItem key={j.id} job={j} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, dot }){
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-1 flex items-center gap-2 text-sm text-neutral-600">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function RecentItem({ job }){
  const status = {
    wishlist: { text:'Wishlist', chip:'bg-neutral-100 text-neutral-700' },
    applied: { text:'Applied', chip:'bg-amber-100 text-amber-800' },
    interviewing: { text:'Interviewing', chip:'bg-blue-100 text-blue-700' },
    offer: { text:'Offer', chip:'bg-emerald-100 text-emerald-700' },
    rejected: { text:'Rejected', chip:'bg-rose-100 text-rose-700' },
  }[job.status] || { text: job.status, chip: 'bg-neutral-100 text-neutral-700' }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-4">
      <div className="min-w-0">
        <div className="font-medium text-neutral-900">{job.title}</div>
        <div className="text-sm text-neutral-500">{job.company}</div>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${status.chip}`}>
          {status.text}
        </span>
        <div className="mt-2 text-sm text-neutral-400">{job.updatedAt}</div>
      </div>
    </div>
  )
}