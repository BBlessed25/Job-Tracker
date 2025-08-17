import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { api, setAuth, useApi, mock } from '../utils/api.js'
import { fmtDate, uid } from '../utils/date.js'

const STATUS = ['wishlist','applied','interviewing','offer','rejected']

const initialState = {
  user: null,
  jobs: [],
  authStatus: 'idle',
  jobsStatus: 'idle',
  error: null,
}

function reducer(state, action){
  switch(action.type){
    case 'AUTH_LOADING': return { ...state, authStatus:'loading', error:null }
    case 'AUTH_SUCCESS': return { ...state, user:action.user, authStatus:'authenticated', error:null }
    case 'AUTH_ERROR': return { ...state, authStatus:'error', error:action.error }
    case 'LOGOUT': return { ...state, user:null, authStatus:'unauthenticated' }
    case 'JOBS_LOADING': return { ...state, jobsStatus:'loading' }
    case 'JOBS_SET': return { ...state, jobs:action.jobs, jobsStatus:'succeeded' }
    case 'JOBS_ERROR': return { ...state, jobsStatus:'failed', error:action.error }
    default: return state
  }
}

export const AppContext = createContext(null)

export function AppProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState)

  // bootstrap
  useEffect(()=>{
    const u = mock.getUser()
    const j = mock.listJobs()
    if (u) dispatch({ type:'AUTH_SUCCESS', user:u })
    if (j?.length) dispatch({ type:'JOBS_SET', jobs:j })
    else seed()
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
        setAuth(data.token)
        dispatch({ type:'AUTH_SUCCESS', user: data.user })
      } else {
        await new Promise(r=>setTimeout(r,500))
        const user = { id:'1', fullName:'John Doe', email }
        mock.setUser(user)
        dispatch({ type:'AUTH_SUCCESS', user })
      }
    }catch(err){
      dispatch({ type:'AUTH_ERROR', error:'Login failed' })
    }
  }

  const signup = async (name, email, password) => {
    dispatch({ type:'AUTH_LOADING' })
    try{
      if (useApi){
        const { data } = await api.post('/auth/signup', { name, email, password })
        setAuth(data.token)
        dispatch({ type:'AUTH_SUCCESS', user: data.user })
      } else {
        await new Promise(r=>setTimeout(r,600))
        const user = { id:'1', fullName: name || 'John Doe', email }
        mock.setUser(user)
        dispatch({ type:'AUTH_SUCCESS', user })
      }
    }catch(err){
      dispatch({ type:'AUTH_ERROR', error:'Signup failed' })
    }
  }

  const logout = () => {
    if (useApi) setAuth(null)
    mock.clearUser()
    dispatch({ type:'LOGOUT' })
  }

  const fetchJobs = async () => {
    dispatch({ type:'JOBS_LOADING' })
    try{
      if (useApi){
        const { data } = await api.get('/jobs')
        dispatch({ type:'JOBS_SET', jobs: data })
      } else {
        await new Promise(r=>setTimeout(r,300))
        dispatch({ type:'JOBS_SET', jobs: mock.listJobs() })
      }
    }catch(err){
      dispatch({ type:'JOBS_ERROR', error:'Failed to load jobs' })
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
      await api.post('/jobs', job)
      await fetchJobs()
      return
    }
    const next = [...state.jobs, job]
    dispatch({ type:'JOBS_SET', jobs: next })
    mock.saveJobs(next)
  }

  const updateJob = async (id, updates) => {
    if (useApi){
      await api.patch(`/jobs/${id}`, updates)
      await fetchJobs()
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

  const updateProfile = async (data) => {
    if (useApi){
      const { data:u } = await api.patch('/me', data)
      dispatch({ type:'AUTH_SUCCESS', user:u })
      return
    }
    const u = { ...(state.user || {}), ...data }
    mock.setUser(u)
    dispatch({ type:'AUTH_SUCCESS', user:u })
  }

  const changePassword = async ({ currentPassword, newPassword }) => {
    if (useApi){
      await api.post('/auth/change-password', { currentPassword, newPassword })
      return
    }
    await new Promise(r=>setTimeout(r,400))
  }

  const value = useMemo(()=>({ state, login, signup, logout, fetchJobs, addJob, updateJob, deleteJob, updateProfile, changePassword }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(){
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
