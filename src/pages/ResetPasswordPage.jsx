// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('')
        setSuccess('')
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const onSubmit = async (e) => {
    e.preventDefault()
    const eTrim = email.trim().toLowerCase()

    if (!eTrim) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(eTrim)) {
      setError('Please enter a valid email address')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: eTrim }),
        redirect: 'follow'
      }

      const response = await fetch("https://seamfix-jobtracker-apis.onrender.com/api/auth/forgotPassword", requestOptions)
      const result = await response.text()
      
      if (response.ok) {
        setSuccess('Password reset link has been sent to your email address')
        setEmail('')
      } else {
        setError('Failed to send reset link. Please try again.')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
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
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button type="submit" className="mt-2 w-full" loading={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
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