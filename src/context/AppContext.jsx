import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { api, setAuth, getAuthToken, debugAuthState, clearInvalidToken, useApi, mock } from '../utils/api.js'
import { fmtDate, uid } from '../utils/date.js'

const STATUS = ['wishlist','applied','interviewing','offer','rejected']

const initialState = {
  user: null,
  jobs: [],
  authStatus: 'idle',
  jobsStatus: 'idle',
  error: null,
  justSignedUp: false,
}

function reducer(state, action){
  switch(action.type){
    case 'AUTH_LOADING': return { ...state, authStatus:'loading', error:null }
    case 'AUTH_SUCCESS': return { ...state, user:action.user, authStatus:'authenticated', error:null, justSignedUp: !!action.justSignedUp }
    case 'AUTH_ERROR': return { ...state, authStatus:'error', error:action.error }
    case 'LOGOUT': return { ...state, user:null, authStatus:'unauthenticated' }
    case 'JOBS_LOADING': return { ...state, jobsStatus:'loading' }
    case 'JOBS_SET': return { ...state, jobs:action.jobs, jobsStatus:'succeeded' }
    case 'JOBS_ERROR': return { ...state, jobsStatus:'failed', error:action.error }
    default: return state
  }
}

export const AppContext = createContext(null)

// Guard variables to avoid duplicate bootstraps/fetches in StrictMode and
// to prevent concurrent /jobs requests that can overwhelm the browser
let __bootstrapDone = false
let __jobsFetchInFlight = false

export function AppProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState)

  // bootstrap
  useEffect(()=>{
    const initializeApp = async () => {
      if (__bootstrapDone) return
      __bootstrapDone = true
      if (useApi) {
        // Enter a loading state during auth bootstrap so the UI can show a spinner
        dispatch({ type:'AUTH_LOADING' })
        // Check if we have a stored token
        const token = getAuthToken()
        console.log('Bootstrap: Checking for stored token...', token ? 'Found' : 'Not found')
        if (token) {
          try {
            // Try to fetch user profile to validate the token
            console.log('Found stored token, validating...')
            console.log('Token preview:', token.substring(0, 20) + '...')
            const { data: user } = await api.get('/users/me')
            console.log('Token valid, user authenticated:', user)
            dispatch({ type:'AUTH_SUCCESS', user })
            
            // Fetch jobs after successful authentication
            console.log('Fetching jobs after successful authentication...')
            await fetchJobs()
          } catch (err) {
            console.error('Token validation failed:', err)
            console.error('Error details:', err.response?.data || err.message)
            // Token is invalid, clear it
            console.log('Clearing invalid token and redirecting to login')
            clearInvalidToken()
            dispatch({ type:'AUTH_ERROR', error: 'Session expired. Please log in again.' })
          }
        } else {
          console.log('No stored token found - user needs to log in')
          // Explicitly mark as unauthenticated so routes can render without redirects
          dispatch({ type:'LOGOUT' })
        }
      } else {
        // Mock mode - use localStorage
        const u = mock.getUser()
        const j = mock.listJobs()
        if (u) dispatch({ type:'AUTH_SUCCESS', user:u })
        if (j?.length) dispatch({ type:'JOBS_SET', jobs:j })
        else seed()
      }
    }
    
    initializeApp()
  }, [])

  function seed(){
    const sample = [
      { id: uid(), title:'Full Stack Engineer', company:'BigTech Inc', salary:'$120,000 - $180,000', status:'wishlist', notes:'FAANG company, challenging interview process', updatedAt:'2024-01-09' },
      { id: uid(), title:'Frontend Developer', company:'Tech Corp', salary:'$80,000 - $120,000', status:'applied', notes:'Great team culture, remote-friendly', updatedAt:'2024-01-14' },
      { id: uid(), title:'React Developer', company:'StartupXYZ', salary:'$90,000 - $130,000', status:'interviewing', notes:'Early stage startup, equity options', updatedAt:'2024-01-24' },
    ]
    dispatch({ type:'JOBS_SET', jobs: sample })
    mock.saveJobs(sample)
  }

  const login = async (email, password) => {
    dispatch({ type:'AUTH_LOADING' })
    try{
      if (useApi){
        const { data } = await api.post('/auth/login', { email, password })
        console.log('Login successful, setting auth token:', data.token)
        setAuth(data.token)
        console.log('Auth token set, now fetching jobs...')
        dispatch({ type:'AUTH_SUCCESS', user: data.user, justSignedUp: false })
        try { sessionStorage.removeItem('jt_justSignedUp') } catch {}
        
        // Fetch jobs after successful login
        await fetchJobs()
      } else {
        await new Promise(r=>setTimeout(r,500))
        const user = { id:'1', fullName:'John Doe', email }
        mock.setUser(user)
        dispatch({ type:'AUTH_SUCCESS', user, justSignedUp: false })
        try { sessionStorage.removeItem('jt_justSignedUp') } catch {}
      }
    }catch(err){
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Login failed'
      dispatch({ type:'AUTH_ERROR', error: errorMessage })
      throw err // Re-throw to let the component handle it
    }
  }

  const signup = async (name, email, password) => {
    dispatch({ type:'AUTH_LOADING' })
    try{
      if (useApi){
        const { data } = await api.post('/auth/signup', { 
          fullName: name, 
          email, 
          password 
        })
        
        console.log('Signup successful, setting auth token:', data.token)
        setAuth(data.token)
        dispatch({ type:'AUTH_SUCCESS', user: data.user, justSignedUp: true })
        // Persist member since for newly signed up users (Month YYYY)
        try {
          const userId = data.user?.id || data.user?._id
          if (userId) {
            const memberSince = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
            localStorage.setItem(`jt_member_since_${userId}`, memberSince)
          }
        } catch {}
        try { sessionStorage.setItem('jt_justSignedUp', '1') } catch {}
        
        // Fetch jobs after successful signup
        await fetchJobs()
      } else {
        await new Promise(r=>setTimeout(r,600))
        const user = { id:'1', fullName: name || 'John Doe', email }
        mock.setUser(user)
        dispatch({ type:'AUTH_SUCCESS', user, justSignedUp: true })
        try {
          const memberSince = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
          localStorage.setItem(`jt_member_since_${user.id}`, memberSince)
        } catch {}
        try { sessionStorage.setItem('jt_justSignedUp', '1') } catch {}
      }
    }catch(err){
      console.error('Signup error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed'
      dispatch({ type:'AUTH_ERROR', error: errorMessage })
      throw err // Re-throw to let the component handle it
    }
  }

  const logout = () => {
    if (useApi) setAuth(null)
    mock.clearUser()
    dispatch({ type:'LOGOUT' })
    try { sessionStorage.removeItem('jt_justSignedUp') } catch {}
  }

  const fetchJobs = async (opts = {}) => {
    if (__jobsFetchInFlight) {
      console.log('fetchJobs skipped: in flight')
      return
    }
    __jobsFetchInFlight = true
    if (!opts.silent) {
      dispatch({ type:'JOBS_LOADING' })
    }
    try{
      if (useApi){
        console.log('Attempting to fetch jobs from API...')
        debugAuthState() // Debug authentication state
        
        const { data } = await api.get('/jobs')
        
        // Map API response to frontend format
        const mappedJobs = data.map(job => ({
          ...job,
          id: job.id || job._id, // Use id if available, fallback to _id
          status: job.status?.toLowerCase() || 'wishlist', // Convert status to lowercase
          url: job.link || '', // Map link to url for frontend compatibility
          summary: job.notes || '', // Map notes to summary for frontend compatibility
          updatedAt: fmtDate(job.updatedAt || job.createdAt || new Date())
        }))
        
        console.log('Fetched jobs successfully:', mappedJobs)
        dispatch({ type:'JOBS_SET', jobs: mappedJobs })
      } else {
        await new Promise(r=>setTimeout(r,300))
        dispatch({ type:'JOBS_SET', jobs: mock.listJobs() })
      }
    }catch(err){
      console.error('Failed to fetch jobs:', err)
      
      // Some backends return 404 when a new user has no jobs yet.
      // Treat this as an empty list rather than a hard error so the
      // board renders with zero items instead of showing an error.
      if (err?.response?.status === 404) {
        console.log('No jobs found for user (404). Rendering empty board.')
        dispatch({ type:'JOBS_SET', jobs: [] })
        return
      }
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load jobs'
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.'
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.'
        // Clear any invalid token
        setAuth(null)
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.'
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      }
      
      dispatch({ type:'JOBS_ERROR', error: errorMessage })
    }
    finally {
      __jobsFetchInFlight = false
    }
  }

  const addJob = async (data) => {
    const job = {
      id: uid(),
      title: data.title?.trim() || 'Untitled role',
      company: data.company?.trim() || 'Unknown',
      link: data.link,
      salary: data.salary,
      status: data.status || 'wishlist',
      notes: data.notes || '',
      updatedAt: fmtDate(new Date()),
    }
    if (useApi){
      // Use the new API endpoint for creating jobs
      const jobData = {
        title: data.title?.trim() || 'Untitled role',
        company: data.company?.trim() || 'Unknown',
        status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Wishlist',
        salary: data.salary || '',
        notes: data.notes || '',
        link: data.url || '' // Map url to link for API compatibility
      }
      
      console.log('Creating job with data:', jobData)
      const response = await api.post('/jobs/create', jobData)
      console.log('Job created successfully:', response.data)
      try {
        await fetchJobs({ silent: true })
      } catch (e) {
        console.warn('fetchJobs after create failed; job was created. Proceeding without refresh.', e)
      }
      return
    }
    const next = [...state.jobs, job]
    dispatch({ type:'JOBS_SET', jobs: next })
    mock.saveJobs(next)
  }

  const updateJob = async (id, updates) => {
    if (useApi){
      // Map frontend updates to API format
      const apiUpdates = { ...updates }
      
      // Capitalize status if it's being updated
      if (updates.status) {
        apiUpdates.status = updates.status.charAt(0).toUpperCase() + updates.status.slice(1)
      }
      
      // Map url to link for API compatibility
      if (updates.url !== undefined) {
        apiUpdates.link = updates.url
        delete apiUpdates.url
      }
      
      // Map summary to notes for API compatibility
      if (updates.summary !== undefined) {
        apiUpdates.notes = updates.summary
        delete apiUpdates.summary
      }
      
      console.log('Updating job with API data:', apiUpdates)
      // Use PUT method as specified in the API documentation
      await api.put(`/jobs/${id}`, apiUpdates)
      // Refresh jobs silently so UI doesn't jump to full-screen loader
      await fetchJobs({ silent: true })
      return
    }
    const next = state.jobs.map(j => j.id === id ? { ...j, ...updates, updatedAt: fmtDate(new Date()) } : j)
    dispatch({ type:'JOBS_SET', jobs: next })
    mock.saveJobs(next)
  }

  const deleteJob = async (id) => {
    if (useApi){
      await api.delete(`/jobs/${id}`)
      await fetchJobs()
      return
    }
    const next = state.jobs.filter(j => j.id !== id)
    dispatch({ type:'JOBS_SET', jobs: next })
    mock.saveJobs(next)
  }

  const fetchUserProfile = async () => {
    if (useApi){
      try {
        console.log('Fetching user profile...')
        const { data } = await api.get('/users/me')
        console.log('User profile fetched:', data)
        dispatch({ type:'AUTH_SUCCESS', user: data })
        return data
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
        throw err
      }
    }
    return state.user
  }

  const updateProfile = async (data) => {
    if (useApi){
      // Only send fields that have actually changed
      const updateData = {}
      const currentUser = state.user || {}
      
      if (data.fullName && data.fullName !== currentUser.fullName) {
        updateData.fullName = data.fullName
      }
      
      if (data.email && data.email.toLowerCase() !== currentUser.email?.toLowerCase()) {
        updateData.email = data.email
      }
      
      // If no fields have changed, don't make the API call
      if (Object.keys(updateData).length === 0) {
        console.log('No changes detected, skipping API call')
        return currentUser
      }
      
      console.log('Updating profile with data:', updateData)
      try {
        const { data:u } = await api.put('/users/me', updateData)
        console.log('Profile updated successfully:', u)
        // Some APIs return { user: {...} } while others return the user object directly.
        // Also handle APIs that only return a message by merging the update data locally.
        let updatedUser = (u && (u.user || u)) || {}
        if (!updatedUser || typeof updatedUser !== 'object' || Object.keys(updatedUser).length === 0) {
          updatedUser = { ...currentUser, ...updateData }
        }
        // Ensure we optimistically merge in updateData if API omitted fields
        updatedUser = { ...currentUser, ...updatedUser, ...updateData }
        dispatch({ type:'AUTH_SUCCESS', user: updatedUser })
        return updatedUser
      } catch (err) {
        console.error('Profile update error:', err.response?.data || err.message)
        
        // Check for specific error messages in the response
        const errorMessage = err.response?.data?.message || err.message
        
        if (err.response?.status === 409 || errorMessage.includes('already in use')) {
          throw new Error('Email already in use by another user. Please choose a different email address.')
        } else if (errorMessage.includes('already using this email')) {
          throw new Error('You are already using this email address. No changes were made.')
        } else if (err.response?.status === 400) {
          throw new Error('Invalid data provided. Please check your information and try again.')
        } else {
          throw new Error('Failed to update profile. Please try again.')
        }
      }
    }
    const u = { ...(state.user || {}), ...data }
    mock.setUser(u)
    dispatch({ type:'AUTH_SUCCESS', user:u })
    return u
  }

  const changePassword = async ({ currentPassword, newPassword }) => {
    if (useApi){
      console.log('Changing password...')
      try {
        await api.put('/users/me/password', { currentPassword, newPassword })
        console.log('Password changed successfully')
        return
      } catch (err) {
        console.error('Password change error:', err.response?.data || err.message)
        
        // Provide specific error messages based on response
        const errorMessage = err.response?.data?.message || err.message
        
        if (err.response?.status === 400) {
          throw new Error('Invalid password. Please check your current password and try again.')
        } else if (err.response?.status === 401) {
          throw new Error('Authentication required. Please log in again.')
        } else if (errorMessage.includes('current password')) {
          throw new Error('Current password is incorrect. Please try again.')
        } else {
          throw new Error('Failed to change password. Please try again.')
        }
      }
    }
    await new Promise(r=>setTimeout(r,400))
  }

  const value = useMemo(()=>({ state, login, signup, logout, fetchJobs, addJob, updateJob, deleteJob, updateProfile, changePassword, fetchUserProfile }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(){
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}