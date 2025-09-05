import { useState } from 'react'

export function Input({ label, error, className='', ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const type = props?.type || 'text'
  const isPassword = type === 'password'

  return (
    <label className="block relative">
      {label && <div className="mb-1.5 text-sm font-medium text-neutral-700">{label}</div>}
      <input
        className={`w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 ${isPassword ? 'pr-10' : ''} py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${className}`}
        {...props}
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
      />
      {isPassword && (
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-[34px] grid h-8 w-8 place-content-center rounded-lg text-neutral-500 hover:bg-neutral-200"
          onClick={()=> setShowPassword(v=>!v)}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 0 0 1.06-1.06l-2.396-2.396a12.28 12.28 0 0 0 3.016-3.758.75.75 0 0 0 0-.634C19.838 8.003 15.332 5.25 12 5.25a8.21 8.21 0 0 0-3.41.79L3.53 2.47Z"/>
              <path d="M6.266 7.206 8.01 8.95A6.75 6.75 0 0 1 12 8.25c2.598 0 5.79 1.77 8.208 4.958a10.78 10.78 0 0 1-2.385 2.61l-1.78-1.78a4.5 4.5 0 0 0-6.622-6.622L7.33 5.933a9.72 9.72 0 0 1 1.192-.49 9.7 9.7 0 0 1 3.478-.693c3.95 0 8.88 2.993 11.88 7.75a.75.75 0 0 1 0 .634 12.28 12.28 0 0 1-3.016 3.758L20.47 20.47a.75.75 0 1 1-1.06 1.06l-2.127-2.127a9.68 9.68 0 0 1-5.283 1.347c-3.95 0-8.88-2.993-11.88-7.75a.75.75 0 0 1 0-.634c1.36-2.216 3.09-4.054 5.146-5.16Z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 5.25c3.332 0 7.838 2.753 11.208 7.316a.75.75 0 0 1 0 .868C19.838 17.997 15.332 20.75 12 20.75s-7.838-2.753-11.208-7.316a.75.75 0 0 1 0-.868C4.162 8.003 8.668 5.25 12 5.25Zm0 2.25c-2.598 0-5.79 1.77-8.208 4.958C6.21 15.647 9.402 17.417 12 17.417s5.79-1.77 8.208-4.958C17.79 9.27 14.598 7.5 12 7.5Zm0 2.25a3.667 3.667 0 1 1 0 7.333 3.667 3.667 0 0 1 0-7.333Z"/>
            </svg>
          )}
        </button>
      )}
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
  