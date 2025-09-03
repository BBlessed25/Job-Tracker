import { Link } from 'react-router-dom'
import Button from './Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { motion } from 'framer-motion'

function Brand(){
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-neutral-900">
      <span className="grid h-8 w-8 place-content-center rounded-full bg-neutral-900 text-white">JT</span>
      <span>JobTracker</span>
    </Link>
  )
}

export function PublicNav(){
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Brand/>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-neutral-700 hover:text-neutral-900" to="/login">
            <motion.span whileTap={{scale:0.96}} transition={{duration:0.2}}>Login</motion.span>
          </Link>
          <Link to="/signup">
            <Button className="px-4 py-2">
              <motion.span whileTap={{scale:0.96}} transition={{duration:0.2}}>Sign Up</motion.span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export function AuthNav(){
  const { state } = useApp()
  const name = state.user?.fullName || 'John Doe'
  const initials = (name.split(' ').map(p=>p[0]).slice(0,2).join('') || 'J').slice(0,1)

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Brand/>
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          {/* Hide Dashboard on very small screens to avoid x-overflow */}
          <Link className="hidden sm:inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 hover:shadow-sm" to="/dashboard">
            <motion.span whileTap={{scale:0.96}} transition={{duration:0.2}}>Dashboard</motion.span>
          </Link>
          <Link className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 hover:shadow-sm whitespace-nowrap" to="/board">
            <motion.span whileTap={{scale:0.96}} transition={{duration:0.2}}>Board</motion.span>
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 pl-2 text-neutral-900 transition-colors hover:bg-neutral-200 hover:shadow-sm min-w-0 max-w-[60vw]"
            aria-label="Open profile settings"
          >
            <div className="grid h-9 w-9 place-content-center rounded-full bg-neutral-900 text-white text-sm font-semibold">{initials}</div>
            <span className="text-sm font-medium truncate">{name}</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}