export default function StatCard({ label, value, dot }){
    return (
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500"><span className={`h-2 w-2 rounded-full ${dot}`} />{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    )
  }
  