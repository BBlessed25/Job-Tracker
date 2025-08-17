import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { motion } from 'framer-motion'

export default function SignUpPage(){
  const { signup, state } = useApp()
  const nav = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mismatch, setMismatch] = useState(false)

  useEffect(()=>{ setMismatch(Boolean(confirm) && password !== confirm) }, [password, confirm])
  useEffect(()=>{ if (state.authStatus === 'authenticated') nav('/dashboard') }, [state.authStatus])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setMismatch(true); return }
    await signup(name, email, password)
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl place-items-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">Create your account</h2>
          <p className="mt-1 text-sm text-neutral-400">Get started with JobTracker today</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Full Name" placeholder="Enter your full name" value={name} onChange={(e)=>setName(e.target.value)} />
          <Input label="Email" type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <Input label="Password" type="password" placeholder="Create a password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <Input label="Confirm Password" type="password" placeholder="Confirm your password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} error={mismatch ? 'Passwords do not match' : ''} />
          <Button className="mt-2 w-full" loading={state.authStatus === 'loading'}>Create Account</Button>
        </form>

        <div className="mt-5 text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-neutral-900 hover:underline">
            <motion.span whileTap={{ scale: 0.96 }} transition={{ duration: 0.2 }}>Sign in</motion.span>
          </Link>
        </div>
      </div>
    </div>
  )
}
