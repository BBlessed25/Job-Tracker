const STATUS_COLOR = {
    wishlist: { bar: 'bg-slate-300', chip: 'bg-slate-200 text-slate-700' },
    applied: { bar: 'bg-blue-300', chip: 'bg-blue-100 text-blue-700' },
    interviewing: { bar: 'bg-amber-300', chip: 'bg-amber-100 text-amber-800' },
    offer: { bar: 'bg-emerald-300', chip: 'bg-emerald-100 text-emerald-800' },
    rejected: { bar: 'bg-rose-300', chip: 'bg-rose-100 text-rose-800' },
  }
  const STATUS_LABEL = { wishlist:'Wishlist', applied:'Applied', interviewing:'Interviewing', offer:'Offer', rejected:'Rejected' }
  
  export default function JobCard({ job, onEdit, onDelete }){
    const color = STATUS_COLOR[job.status]
    return (
      <div draggable onDragStart={(e)=> e.dataTransfer.setData('text/plain', job.id)} className="group relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-2xl ${color.bar}`} />
        <div className="mb-1 text-lg font-semibold text-neutral-900">{job.title}</div>
        <div className="mb-3 text-neutral-500">{job.company}</div>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${color.chip}`}>{STATUS_LABEL[job.status]}</span>
          {job.salary && <span className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-1 text-xs text-neutral-700">{job.salary}</span>}
        </div>
        {job.notes && <div className="mb-3 text-sm text-neutral-600">{job.notes}</div>}
        <div className="flex items-center justify-between border-t pt-3 text-sm text-neutral-400">
          <span>Updated {job.updatedAt}</span>
          <div className="flex items-center gap-3 opacity-80">
            {job.link && (<a className="hover:text-neutral-600" href={job.link} target="_blank" rel="noreferrer" title="Open link">↗</a>)}
            <button onClick={() => onEdit(job)} title="Edit" className="hover:text-neutral-600">✎</button>
            <button onClick={() => onDelete(job.id)} title="Delete" className="hover:text-rose-600">🗑️</button>
          </div>
        </div>
      </div>
    )
  }
  