// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Check for token on component mount
  useEffect(() => {
    const token = searchParams.get('token')
    console.log('ResetPasswordPage - Token from URL:', token)
    console.log('ResetPasswordPage - Full URL:', window.location.href)
    console.log('ResetPasswordPage - Search params:', searchParams.toString())
    
    if (!token) {
      console.log('No token found, showing error message instead of redirecting')
      setError('Invalid or missing reset token. Please request a new password reset.')
      setCheckingToken(false)
    } else {
      setCheckingToken(false)
    }
  }, [searchParams, navigate])

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
    const pTrim = password.trim()
    const cpTrim = confirmPassword.trim()

    if (!pTrim || !cpTrim) {
      setError('Please fill in all fields')
      return
    }

    if (pTrim !== cpTrim) {
      setError('Passwords do not match')
      return
    }

    if (pTrim.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Get token from URL parameters
      const token = searchParams.get('token')
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.')
        setLoading(false)
        return
      }

      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password: pTrim,
          token: token
        }),
        redirect: 'follow'
      }

      const response = await fetch("https://seamfix-jobtracker-apis.onrender.com/api/auth/reset-password", requestOptions)
      const result = await response.text()
      
      if (response.ok) {
        setSuccess('Password has been reset successfully. You can now sign in with your new password.')
        setPassword('')
        setConfirmPassword('')
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError('Failed to reset password. The link may have expired. Please request a new password reset.')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking for token
  if (checkingToken) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <div className="flex items-center justify-center gap-3 text-neutral-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
            <span className="text-sm">Validating reset link...</span>
          </div>
        </div>
      </div>
    )
  }

  // Get token to check if we should show the form
  const token = searchParams.get('token')

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8">
        <h2 className="text-center text-lg font-semibold">Create new password</h2>
        <p className="mb-6 text-center text-sm text-neutral-500">
          Enter your new password below
        </p>

        {!token ? (
          // Show error message and link to request new reset
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-600">
                Invalid or missing reset token. Please request a new password reset.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        ) : (
          // Show password reset form
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" className="mt-2 w-full" loading={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-neutral-700 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}