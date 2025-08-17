
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'

export default function ResetPasswordPage(){
  const [email, setEmail] = useState('')
  const nav = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    // pretend to send the link, then go back to login
    nav('/login')
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl place-items-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">Reset your password</h2>
          <p className="mt-1 text-sm text-neutral-400">Enter your email and we'll send you a reset link</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
          />
          <Button className="mt-2 w-full">Send Reset Link</Button>
        </form>

        <div className="mt-5 text-center text-sm">
          <Link to="/login" className="text-neutral-700 hover:text-neutral-900">Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
