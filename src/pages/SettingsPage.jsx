// src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'

function Row({ label, value }){
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="text-neutral-600">{label}</div>
      <div className="mt-1 font-medium text-neutral-900">{value}</div>
    </div>
  )
}

export default function SettingsPage(){
  const { state, updateProfile, changePassword, logout, fetchUserProfile } = useApp()
  const [fullName, setFullName] = useState(state.user?.fullName || 'John Doe')
  const [email, setEmail] = useState(state.user?.email || 'JOHN@GMAIL.COM')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [notice, setNotice] = useState(null)

  // Fetch user profile when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      // Only fetch if authenticated and user data is not already loaded
      if (state.authStatus === 'authenticated' && !state.user?.id && !loadingProfile) {
        setLoadingProfile(true)
        try {
          const userData = await fetchUserProfile()
          setFullName(userData?.fullName || 'John Doe')
          setEmail((userData?.email || 'john@gmail.com').toUpperCase())
        } catch (error) {
          console.error('Failed to load user profile:', error)
          setNotice({ type: 'error', text: 'Failed to load profile information' })
        } finally {
          setLoadingProfile(false)
        }
      }
    }
    
    loadUserProfile()
  }, [state.authStatus]) // Remove fetchUserProfile from dependencies

  useEffect(()=>{
    if (state.user?.id) {
      setFullName(state.user?.fullName || 'John Doe')
      setEmail((state.user?.email || 'john@gmail.com').toUpperCase())
    }
  }, [state.user])

  const initials = (fullName || 'John Doe').split(' ').map(p=>p[0]).slice(0,2).join('') || 'J'

  const onSaveProfile = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!fullName.trim()) {
      setNotice({ type:'error', text:'Full name is required.' })
      return
    }
    
    if (!email.trim()) {
      setNotice({ type:'error', text:'Email is required.' })
      return
    }
    
    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.toLowerCase())) {
      setNotice({ type:'error', text:'Please enter a valid email address.' })
      return
    }
    
    // Check if email is the same as current user's email
    const currentEmail = state.user?.email?.toLowerCase()
    const newEmail = email.toLowerCase()
    if (currentEmail && newEmail === currentEmail) {
      setNotice({ type:'error', text:'You are already using this email address. Please enter a different email or keep the current one.' })
      return
    }
    
    // Check if there are any actual changes
    const currentFullName = state.user?.fullName || ''
    if (currentFullName === fullName && currentEmail === newEmail) {
      setNotice({ type:'info', text:'No changes detected. Your profile is already up to date.' })
      return
    }
    
    setSavingProfile(true)
    try{
      // Send email in lowercase to avoid API validation issues
      const emailToSend = email.toLowerCase()
      console.log('Saving profile with data:', { fullName, email: emailToSend })
      await updateProfile?.({ fullName, email: emailToSend })
      setNotice({ type:'success', text:'Profile updated successfully!' })
    } catch (error) {
      console.error('Failed to update profile:', error)
      const errorMessage = error.message || 'Failed to update profile. Please try again.'
      setNotice({ type:'error', text: errorMessage })
    } finally {
      setSavingProfile(false)
    }
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmNewPassword){
      setNotice({ type:'error', text:'Please fill in all password fields' })
      return
    }
    if (newPassword !== confirmNewPassword){
      setNotice({ type:'error', text:'Passwords do not match' })
      return
    }
    await changePassword?.({ currentPassword, newPassword })
    setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('')
    setNotice({ type:'success', text:'Password updated successfully!' })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      {/* Back link */}
      <div className="mb-4 text-sm">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
          <span>←</span>
          <motion.span whileTap={{ scale: 0.96 }} transition={{ duration: 0.2 }}>Back to Dashboard</motion.span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
      <p className="mb-6 text-neutral-500">Manage your account settings and preferences</p>

      {/* Notices */}
      {notice && (
        <div className={
          `mb-6 rounded-2xl border p-4 text-sm ${
            notice.type==='success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 
            notice.type==='info' ? 'border-blue-200 bg-blue-50 text-blue-800' :
            'border-rose-200 bg-rose-50 text-rose-700'
          }`
        }>
          {notice.text}
        </div>
      )}

      {/* Profile Information */}
      <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-900">
              <span className="inline-grid h-6 w-6 place-content-center rounded-md bg-neutral-900 text-xs text-white">👤</span>
              <span className="font-semibold">Profile Information</span>
              {loadingProfile && (
                <span className="text-sm text-neutral-500">(Loading...)</span>
              )}
            </div>
            <button
              onClick={async () => {
                if (loadingProfile) return // Prevent multiple simultaneous requests
                setLoadingProfile(true)
                try {
                  const userData = await fetchUserProfile()
                  setFullName(userData?.fullName || 'John Doe')
                  setEmail((userData?.email || 'john@gmail.com').toUpperCase())
                  setNotice({ type: 'success', text: 'Profile refreshed successfully!' })
                } catch (error) {
                  console.error('Failed to refresh profile:', error)
                  setNotice({ type: 'error', text: 'Failed to refresh profile' })
                } finally {
                  setLoadingProfile(false)
                }
              }}
              disabled={loadingProfile}
              className="text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
            >
              🔄 Refresh
            </button>
          </div>
        <p className="text-sm text-neutral-500">Update your personal information and contact details</p>
        </div>

        <div className="flex items-center gap-4 pb-5">
          <div className="grid h-16 w-16 place-content-center rounded-full bg-neutral-900 text-white text-lg font-semibold">{initials}</div>
          <div className="min-w-0">
            <div className="font-medium text-neutral-900">{fullName}</div>
            <div className="text-sm text-neutral-500 uppercase">{email}</div>
          </div>
        </div>
        <div className="border-t" />

        <form onSubmit={onSaveProfile} className="mt-5 space-y-4">
          <Input label="Full Name" value={fullName} onChange={(e)=> setFullName(e.target.value)} className="bg-neutral-100" />
          <Input label="Email Address" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} className="bg-neutral-100 uppercase" />
          <div className="flex justify-end">
            <Button className="inline-flex items-center gap-2" disabled={savingProfile}>
              <span className="grid h-5 w-5 place-content-center rounded-md bg-white/10">💾</span>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-neutral-900">
            <span className="inline-grid h-6 w-6 place-content-center rounded-md bg-neutral-900 text-xs text-white">🔒</span>
            <span className="font-semibold">Change Password</span>
          </div>
          <p className="text-sm text-neutral-500">Update your password to keep your account secure</p>
        </div>

        <form onSubmit={onChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" placeholder="Enter your current password" value={currentPassword} onChange={(e)=> setCurrentPassword(e.target.value)} className="bg-neutral-100" />
          <Input label="New Password" type="password" placeholder="Enter your new password" value={newPassword} onChange={(e)=> setNewPassword(e.target.value)} className="bg-neutral-100" />
          <Input label="Confirm New Password" type="password" placeholder="Confirm your new password" value={confirmNewPassword} onChange={(e)=> setConfirmNewPassword(e.target.value)} className="bg-neutral-100" />
          <div className="flex justify-end">
            <Button className="inline-flex items-center gap-2">
              <span className="grid h-5 w-5 place-content-center rounded-md bg-white/10">🔒</span>
              Update Password
            </Button>
          </div>
        </form>
      </section>

      {/* Account Information */}
      <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-3 font-semibold text-neutral-900">Account Information</div>
        <div className="mb-4 text-sm text-neutral-500">Your account details and preferences</div>
        <div className="divide-y divide-neutral-200">
          <Row label="Account ID" value={state.user?.id || 1} />
          <Row label="Member Since" value="January 2024" />
          <Row label="Account Status" value={<span className="text-emerald-600">Active</span>} />
        </div>
      </section>

      {/* Account Actions */}
      <section className="mb-10 rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="mb-3 font-semibold text-neutral-900">Account Actions</div>
        <div className="mb-4 text-sm text-neutral-600">Manage your account session and access</div>
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-white/70 p-4">
          <div>
            <div className="font-semibold text-neutral-900">Sign Out</div>
            <div className="text-sm text-neutral-600">Sign out of your account on this device</div>
          </div>
          <Button variant="danger" className="inline-flex items-center gap-2 rounded-2xl" onClick={logout}>
            <span className="grid h-5 w-5 place-content-center rounded-md bg-white/10">↪</span>
            Sign Out
          </Button>
        </div>
      </section>
    </div>
  )
}