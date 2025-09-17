// src/pages/SignUpPage.jsx
import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { useNavigate } from 'react-router-dom'

export default function SignUpPage() {
  const { state, signup, clearError } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (error || state.error) {
      const timer = setTimeout(() => {
        setError('')
        clearError() // Clear global error state
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [error, state.error, clearError])

  const onSubmit = async (e) => {
    e.preventDefault()

    const n = name.trim()
    const eTrim = email.trim().toLowerCase()
    const p = password.trim()
    const c = confirm.trim()

    if (!n || !eTrim || !p || !c) {
      setError('Please fill in all fields')
      return
    }
    if (p !== c) {
      setError('Passwords do not match')
      return
    }
    
    // Password validation - must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character
    if (p.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (!/(?=.*[a-z])/.test(p)) {
      setError('Password must contain at least one lowercase letter')
      return
    }
    if (!/(?=.*[A-Z])/.test(p)) {
      setError('Password must contain at least one uppercase letter')
      return
    }
    if (!/(?=.*\d)/.test(p)) {
      setError('Password must contain at least one number')
      return
    }
    if (!/(?=.[!@#$%^&(),.?":{}|<>])/.test(p)) {
      setError('Password must contain at least one special character')
      return
    }

    setError('')
    try {
      await signup(n, eTrim, p)
      navigate('/dashboard', { state: { newSignup: true } })
    } catch (err) {
      setError('')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 overflow-x-hidden">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8">
        <h2 className="text-center text-lg font-semibold">Create an account</h2>
        <p className="mb-6 text-center text-sm text-neutral-500">Sign up for JobTracker</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="e.g. name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button className="mt-2 w-full" loading={state.authStatus === 'loading'}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-neutral-900 hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  )
}