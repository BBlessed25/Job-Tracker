import axios from 'axios'

// Build axios instance (disabled if no base URL provided)
export const api = axios.create({
  baseURL: 'https://seamfix-jobtracker-apis.onrender.com/api',
  withCredentials: false,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

let _token = null
export function setAuth(token) {
  _token = token
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`)
  } else {
    delete api.defaults.headers.common['Authorization']
    console.log('Authorization header removed')
  }
}

// Simple helpers to decide if we should use the API or local mocks
export const useApi = true

// Mocks use localStorage as a tiny DB
const LS_JOBS = 'jt_jobs'
const LS_USER = 'jt_user'

export const mock = {
  getUser() {
    const raw = localStorage.getItem(LS_USER)
    return raw ? JSON.parse(raw) : null
  },
  setUser(u) {
    localStorage.setItem(LS_USER, JSON.stringify(u))
  },
  clearUser() {
    localStorage.removeItem(LS_USER)
  },
  listJobs() {
    const raw = localStorage.getItem(LS_JOBS)
    return raw ? JSON.parse(raw) : []
  },
  saveJobs(jobs) {
    localStorage.setItem(LS_JOBS, JSON.stringify(jobs))
  },
}
