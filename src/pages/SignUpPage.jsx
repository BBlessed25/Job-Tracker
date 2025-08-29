// src/pages/SignUpPage.jsx
import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { useNavigate } from 'react-router-dom'

export default function SignUpPage() {
  const { state, signup } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()

    const n = name.trim()
    const eTrim = email.trim()
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

    // Accept ANY valid non-empty inputs → redirect
    setError('')
    await signup(n, eTrim, p)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
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
            onChange={(e) => setEmail(e.target.value)}
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