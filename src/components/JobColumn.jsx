
import JobCard from './JobCard.jsx'
const STATUS_LABEL={ wishlist:'WISHLIST', applied:'APPLIED', interviewing:'INTERVIEWING', offer:'OFFER', rejected:'REJECTED' }
const COLORS={
  wishlist:{ ring:'ring-slate-400', bar:'bg-neutral-300', chip:'bg-slate-100', head:'bg-neutral-200' },
  applied:{ ring:'ring-blue-500', bar:'bg-blue-500', chip:'bg-blue-100', head:'bg-blue-100' },
  interviewing:{ ring:'ring-amber-500', bar:'bg-amber-500', chip:'bg-amber-100', head:'bg-amber-100' },
  offer:{ ring:'ring-emerald-500', bar:'bg-emerald-500', chip:'bg-emerald-100', head:'bg-emerald-100' },
  rejected:{ ring:'ring-rose-500', bar:'bg-rose-500', chip:'bg-rose-100', head:'bg-rose-100' },
}
export default function JobColumn({ status, jobs, onDropJob }){
  const style = COLORS[status]
  const handleDrop=(e)=>{ e.preventDefault(); const id=e.dataTransfer.getData('text/plain'); if(id) onDropJob(id, status) }
  return (
    <div onDragOver={(e)=>e.preventDefault()} onDrop={handleDrop} className="flex flex-col rounded-3xl border border-neutral-200 bg-white">
      {/* colored header with count */}
      <div className={`relative rounded-t-3xl ${style.head} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-wide text-neutral-700">{STATUS_LABEL[status]}</div>
          <span className="rounded-md bg-white/70 px-2 py-1 text-sm text-neutral-700">{jobs.length}</span>
        </div>
        <div className={`absolute left-2 top-1 h-2 w-[96%] rounded-full ${style.bar}`}></div>
      </div>

      {/* list */}
      <div className="scrollbar-thin space-y-4 p-4">
        {jobs.length===0 ? (
          <div className="grid h-40 place-content-center text-neutral-400">No jobs yet</div>
        ) : (
          jobs.map((job)=>(<JobCard key={job.id} job={job} onEdit={()=> onDropJob(job.id, status)} onDelete={()=> onDropJob(job.id, '_DELETE_')} />))
        )}
      </div>
      <div className="px-4 pb-5"></div>
    </div>
  )
}
