import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { motion } from 'framer-motion'

export default function LoginPage(){
  const { login, state } = useApp()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(()=>{ if (state.authStatus === 'authenticated') nav('/dashboard') }, [state.authStatus])

  const onSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl place-items-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">Welcome back</h2>
          <p className="mt-1 text-sm text-neutral-400">Sign in to your JobTracker account</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Email" type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <Button className="mt-2 w-full" loading={state.authStatus === 'loading'}>Sign In</Button>
        </form>

        <div className="mt-5 text-center text-sm">
          <Link className="text-neutral-700 hover:text-neutral-900" to="/reset">
            <motion.span whileTap={{ scale: 0.96 }} transition={{ duration: 0.2 }}>Forgot your password?</motion.span>
          </Link>
        </div>
        <div className="mt-2 text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-neutral-900 hover:underline">
            <motion.span whileTap={{ scale: 0.96 }} transition={{ duration: 0.2 }}>Sign up</motion.span>
          </Link>
        </div>
      </div>
    </div>
  )
}
