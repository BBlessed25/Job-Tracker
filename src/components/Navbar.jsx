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

/** Reusable nav item with a “pill” that shows on hover (not route-active). */
function NavItem({ to, children }){
  return (
    <Link
      to={to}
      className={[
        "text-sm font-medium rounded-lg px-3 py-2 transition-colors",
        "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
        // Prevent nav from causing horizontal overflow on small screens
        "whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
      ].join(" ")}
    >
      <motion.span whileTap={{ scale: 0.96 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.span>
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
    <nav className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur overflow-x-hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Brand/>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/board">Board</NavItem>
          {/* Avatar + Name pill (hover highlight) */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 min-w-0 max-w-[60vw]">
            <div className="grid h-9 w-9 place-content-center rounded-full bg-neutral-900 text-white text-sm font-semibold">
              {initials}
            </div>
            <div className="min-w-0 max-w-full">
              <NavItem to="/settings">{name}</NavItem>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}