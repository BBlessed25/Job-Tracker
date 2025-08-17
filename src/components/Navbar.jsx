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
        <div className="flex items-center gap-6">
          <Link className="text-sm font-medium text-neutral-900" to="/dashboard">
            <motion.span whileTap={{scale:0.96}} transition={{duration:0.2}}>Dashboard</motion.span>
          </Link>
          <Link className="text-sm font-medium text-neutral-900" to="/board">
            <motion.span whileTap={{scale:0.96}} transition={{duration:0.2}}>Board</motion.span>
          </Link>
          <div className="flex items-center gap-2 pl-2">
            <div className="grid h-9 w-9 place-content-center rounded-full bg-neutral-900 text-white text-sm font-semibold">{initials}</div>
            <Link to="/settings" className="text-sm text-neutral-900">{name}</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}