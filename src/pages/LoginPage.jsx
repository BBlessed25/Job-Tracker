// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const { state, login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    const eTrim = email.trim()
    const pTrim = password.trim()

    if (!eTrim || !pTrim) {
      setError('Please fill in all fields')
      return
    }

    setError('')
    await login(eTrim, pTrim)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8">
        <h2 className="text-center text-lg font-semibold">Welcome back</h2>
        <p className="mb-6 text-center text-sm text-neutral-500">
          Sign in to your JobTracker account
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
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

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button className="mt-2 w-full" loading={state.authStatus === 'loading'}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {/* Updated to route to ResetPasswordPage */}
          <Link to="/reset-password" className="text-neutral-700 hover:underline">
            Forgot your password?
          </Link>
          <div className="mt-2 text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-neutral-900 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}