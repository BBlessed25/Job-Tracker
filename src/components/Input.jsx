export function Input({ label, error, className='', ...props }) {
    return (
      <label className="block">
        {label && <div className="mb-1.5 text-sm font-medium text-neutral-700">{label}</div>}
        <input
          className={`w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
      </label>
    )
  }
  
  export function Textarea({ label, className='', ...props }) {
    return (
      <label className="block">
        {label && <div className="mb-1.5 text-sm font-medium text-neutral-700">{label}</div>}
        <textarea
          className={`w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${className}`}
          rows={4}
          {...props}
        />
      </label>
    )
  }
  