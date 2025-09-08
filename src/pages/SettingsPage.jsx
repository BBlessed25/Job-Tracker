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
  const [email, setEmail] = useState((state.user?.email || 'john@gmail.com').toLowerCase())
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [notice, setNotice] = useState(null)
  const [passwordNotice, setPasswordNotice] = useState(null)
  const [changingPassword, setChangingPassword] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [memberSince, setMemberSince] = useState('')

  // Fetch user profile when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      // Only fetch if authenticated and user data is not already loaded
      if (state.authStatus === 'authenticated' && !state.user?.id && !loadingProfile) {
        setLoadingProfile(true)
        try {
          const userData = await fetchUserProfile()
          setFullName(userData?.fullName || 'John Doe')
          setEmail((userData?.email || 'john@gmail.com').toLowerCase())
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
      setEmail((state.user?.email || 'john@gmail.com').toLowerCase())
      // Resolve Member Since once per user change: prefer backend createdAt, else localStorage
      try {
        const createdAt = state.user?.createdAt
        let resolved = ''
        if (createdAt) {
          const d = new Date(createdAt)
          resolved = d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        } else {
          const id = state.user?.id
          const stored = id ? localStorage.getItem(`jt_member_since_${id}`) : ''
          if (stored) resolved = stored
        }
        if (resolved) setMemberSince(resolved)
      } catch {}
    }
  }, [state.user])

  // Track changes to enable/disable save button
  useEffect(() => {
    if (state.user?.id) {
      const currentFullName = state.user?.fullName || ''
      const currentEmail = (state.user?.email || '').toLowerCase()
      const hasNameChanged = fullName !== currentFullName
      const hasEmailChanged = email !== currentEmail
      setHasChanges(hasNameChanged || hasEmailChanged)
    }
  }, [fullName, email, state.user])

  useEffect(() => {
    if (!passwordNotice) return
    // As soon as an inline prompt appears, stop the loading state
    setChangingPassword(false)
    const timeoutId = setTimeout(() => setPasswordNotice(null), 3000)
    return () => clearTimeout(timeoutId)
  }, [passwordNotice])

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
    
    // Check if there are any actual changes
    const currentEmail = state.user?.email?.toLowerCase()
    const newEmail = email.toLowerCase()
    const currentFullName = state.user?.fullName || ''
    const nameChanged = currentFullName !== fullName
    const emailChanged = currentEmail !== newEmail
    
    if (!nameChanged && !emailChanged) {
      setNotice({ type:'info', text:'No changes detected. Your profile is already up to date.' })
      return
    }
    
    setSavingProfile(true)
    try{
      // Send email in lowercase to avoid API validation issues
      const emailToSend = email.toLowerCase()
      console.log('Saving profile with data:', { fullName, email: emailToSend })
      // Optimistic success message (mirrors change password notice)
      let successText = 'profile updated successfully'
      if (nameChanged && !emailChanged) successText = 'full name updated successfully'
      if (emailChanged && !nameChanged) successText = 'email address updated successfully'
      setNotice({ type:'success', text: successText })
      try { document.getElementById('settings-notice')?.scrollIntoView({ behavior:'smooth', block:'start' }) } catch {}
      await updateProfile?.({ fullName, email: emailToSend })
    } catch (error) {
      console.error('Failed to update profile:', error)
      const errorMessage = error.message || 'Failed to update profile. Please try again.'
      setNotice({ type:'error', text: errorMessage })
      try { document.getElementById('settings-notice')?.scrollIntoView({ behavior:'smooth', block:'start' }) } catch {}
    } finally {
      setSavingProfile(false)
    }
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmNewPassword){
      setNotice(null)
      setPasswordNotice({ type:'error', text:'Please fill in all password fields' })
      return
    }
    if (newPassword !== confirmNewPassword){
      setNotice(null)
      setPasswordNotice({ type:'error', text:'New passwords do not match' })
      return
    }
    // Prevent using the same password as current
    if (currentPassword && newPassword && currentPassword === newPassword) {
      setNotice(null)
      setPasswordNotice({ type:'error', text:'Your new password cannot be the same as your current password' })
      return
    }
    
    // Use the same password requirements as SignUpPage
    if (newPassword.length < 8) {
      setNotice(null)
      setPasswordNotice({ type:'error', text:'New password must be at least 8 characters long' })
      return
    }
    if (!/(?=.*[a-z])/.test(newPassword)) {
      setNotice(null)
      setPasswordNotice({ type:'error', text:'New password must contain at least one lowercase letter' })
      return
    }
    if (!/(?=.*[A-Z])/.test(newPassword)) {
      setNotice(null)
      setPasswordNotice({ type:'error', text:'New password must contain at least one uppercase letter' })
      return
    }
    if (!/(?=.*\d)/.test(newPassword)) {
      setNotice(null)
      setPasswordNotice({ type:'error', text:'New password must contain at least one number' })
      return
    }
    if (!/(?=.[!@#$%^&(),.?":{}|<>])/.test(newPassword)) {
      setNotice(null)
      setPasswordNotice({ type:'error', text:'New password must contain at least one special character' })
      return
    }
    
    setChangingPassword(true)
    try {
      await changePassword?.({ currentPassword, newPassword })
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('')
      setNotice(null)
      setPasswordNotice({ type:'success', text:'Password updated successfully' })
    } catch (error) {
      console.error('Password change failed:', error)
      const errorMessage = error.message || 'Failed to change password. Please try again.'
      setNotice(null)
      setPasswordNotice({ type:'error', text: errorMessage })
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8 overflow-x-hidden">
      {/* Back link */}
      <div className="mb-4 text-sm">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
          <span>←</span>
          <motion.span whileTap={{ scale: 0.96 }} transition={{ duration: 0.2 }} className="font-semibold">Back to Dashboard</motion.span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
      <p className="mt-2 mb-6 text-neutral-500">Manage your account settings and preferences</p>

      {/* Notices */}
      {notice && (
        <div id="settings-notice" role="status" aria-live="polite" className={
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
              <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current">
                <g transform="translate(-144 -48)">
                  <g id="Icon">
                    <g transform="translate(8)">
                      <path d="m160 49c-6.071 0-11 4.929-11 11s4.929 11 11 11 11-4.929 11-11-4.929-11-11-11zm0 2c4.967 0 9 4.033 9 9s-4.033 9-9 9-9-4.033-9-9 4.033-9 9-9z"/>
                    </g>
                    <path d="m187 94v-8c0-3.448-1.37-6.754-3.808-9.192s-5.744-3.808-9.192-3.808c-3.861 0-8.139 0-12 0-3.448 0-6.754 1.37-9.192 3.808s-3.808 5.744-3.808 9.192v8c0 .552.448 1 1 1s1-.448 1-1c0 0 0-3.749 0-8 0-2.917 1.159-5.715 3.222-7.778s4.861-3.222 7.778-3.222h12c2.917 0 5.715 1.159 7.778 3.222s3.222 4.861 3.222 7.778v8c0 .552.448 1 1 1s1-.448 1-1z"/>
                  </g>
                </g>
              </svg>
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
                  setEmail((userData?.email || 'john@gmail.com').toLowerCase())
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
              
            </button>
          </div>
        <p className="mt-2 text-sm text-neutral-500">Update your personal information and contact details</p>
        </div>

        <div className="flex items-center gap-4 pb-5">
          <div className="grid h-16 w-16 place-content-center rounded-full bg-neutral-900 text-white text-lg font-semibold">{initials}</div>
          <div className="min-w-0">
            <div className="font-medium text-neutral-900">{fullName}</div>
            <div className="text-sm text-neutral-500">{email}</div>
          </div>
        </div>
        <div className="border-t" />

        <form onSubmit={onSaveProfile} className="mt-5 space-y-4">
          <Input 
            label="Full Name" 
            value={fullName} 
            onChange={(e)=> setFullName(e.target.value)} 
            className={`bg-neutral-100 ${fullName !== (state.user?.fullName || '') ? 'ring-2 ring-blue-200' : ''}`} 
          />
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={(e)=> setEmail(e.target.value.toLowerCase())} 
            className={`bg-neutral-100 ${email !== ((state.user?.email || '').toLowerCase()) ? 'ring-2 ring-blue-200' : ''}`} 
          />
          <div className="flex justify-end">
            <Button 
              type="submit"
              className="inline-flex items-center gap-2" 
              disabled={savingProfile || !hasChanges}
            >
              <span className="grid h-5 w-5 place-content-center rounded-md bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-4 w-4 fill-current">
                  <path d="M30.71,7.29l-6-6A1,1,0,0,0,24,1H4A3,3,0,0,0,1,4V28a3,3,0,0,0,3,3H28a3,3,0,0,0,3-3V8A1,1,0,0,0,30.71,7.29ZM20,3V9H12V3ZM8,29V22a1,1,0,0,1,1-1H23a1,1,0,0,1,1,1v7Zm21-1a1,1,0,0,1-1,1H26V22a3,3,0,0,0-3-3H9a3,3,0,0,0-3,3v7H4a1,1,0,0,1-1-1V4A1,1,0,0,1,4,3h6V9a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V3h1.59L29,8.41Z"/>
                </svg>
              </span>
              {savingProfile ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
            </Button>
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-neutral-900">
            <svg height="512pt" viewBox="-64 0 512 512" width="512pt" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"/>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"/>
            </svg>
            <span className="font-semibold">Change Password</span>
          </div>
          <p className="mt-2 text-sm text-neutral-500">Update your password to keep your account secure</p>
        </div>

        <form onSubmit={onChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" placeholder="Enter your current password" value={currentPassword} onChange={(e)=> { setPasswordNotice(null); setCurrentPassword(e.target.value) }} className="bg-neutral-100" />
          <Input label="New Password" type="password" placeholder="Enter your new password" value={newPassword} onChange={(e)=> { setPasswordNotice(null); setNewPassword(e.target.value) }} className="bg-neutral-100" />
          <Input label="Confirm New Password" type="password" placeholder="Confirm your new password" value={confirmNewPassword} onChange={(e)=> { setPasswordNotice(null); setConfirmNewPassword(e.target.value) }} className="bg-neutral-100" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-h-[1.25rem] text-sm" role="status" aria-live="polite">
              {passwordNotice && (
                <span className={
                  passwordNotice.type==='success' ? 'text-emerald-700' :
                  passwordNotice.type==='info' ? 'text-blue-700' :
                  'text-rose-700'
                }>
                  {passwordNotice.text}
                </span>
              )}
            </div>
            <Button className="inline-flex items-center gap-2" loading={changingPassword} disabled={changingPassword}>
              <span className="grid h-5 w-5 place-content-center rounded-md bg-white/10">
                <svg height="512pt" viewBox="-64 0 512 512" width="512pt" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
                  <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875 16-16 16zm0 0"/>
                  <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"/>
                </svg>
              </span>
              {changingPassword ? 'Updating Password' : 'Update Password'}
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
          <Row label="Member Since" value={memberSince || 'January 2024'} />
          <Row label="Account Status" value={<span className="text-emerald-600">Active</span>} />
        </div>
      </section>

      {/* Account Actions */}
      <section className="mb-10 rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="mb-3 font-semibold text-neutral-900">Account Actions</div>
        <div className="mb-4 text-sm text-neutral-600">Manage your account session and access</div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-white/70 p-4">
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900">Sign Out</div>
            <div className="text-sm text-neutral-600">Sign out of your account on this device</div>
          </div>
          <Button variant="danger" className="inline-flex items-center gap-2 rounded-2xl sm:ml-auto w-full sm:w-auto justify-center" onClick={logout}>
            <span className="grid h-5 w-5 place-content-center rounded-md bg-white/10">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-4 w-4 fill-current">
                <path d="M255.15,468.625H63.787c-11.737,0-21.262-9.526-21.262-21.262V64.638c0-11.737,9.526-21.262,21.262-21.262H255.15
                  c11.758,0,21.262-9.504,21.262-21.262S266.908,0.85,255.15,0.85H63.787C28.619,0.85,0,29.47,0,64.638v382.724
                  c0,35.168,28.619,63.787,63.787,63.787H255.15c11.758,0,21.262-9.504,21.262-21.262
                  C276.412,478.129,266.908,468.625,255.15,468.625z"/>
                <path d="M505.664,240.861L376.388,113.286c-8.335-8.25-21.815-8.143-30.065,0.213s-8.165,21.815,0.213,30.065l92.385,91.173
                  H191.362c-11.758,0-21.262,9.504-21.262,21.262c0,11.758,9.504,21.263,21.262,21.263h247.559l-92.385,91.173
                  c-8.377,8.25-8.441,21.709-0.213,30.065c4.167,4.21,9.653,6.336,15.139,6.336c5.401,0,10.801-2.041,14.926-6.124l129.276-127.575
                  c4.04-3.997,6.336-9.441,6.336-15.139C512,250.302,509.725,244.88,505.664,240.861z"/>
              </svg>
            </span>
            Sign Out
          </Button>
        </div>
      </section>
    </div>
  )
}