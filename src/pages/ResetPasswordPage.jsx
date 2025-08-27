// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    const eTrim = email.trim()

    if (!eTrim) {
      setError('Please enter your email address')
      return
    }

    // Accept ANY non-empty email as a successful request
    setError('')
    // You could show a toast here instead of redirecting
    navigate('/login')
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8">
        <h2 className="text-center text-lg font-semibold">Reset your password</h2>
        <p className="mb-6 text-center text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a reset link
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="mt-2 w-full">
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-neutral-700 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}