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

// Get token from localStorage on initialization
const LS_TOKEN = 'jt_auth_token'
const storedToken = localStorage.getItem(LS_TOKEN)
if (storedToken) {
  _token = storedToken
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
  console.log('Auth token restored from localStorage:', `Bearer ${storedToken.substring(0, 20)}...`)
  console.log('API headers after restoration:', api.defaults.headers.common)
} else {
  console.log('No stored token found in localStorage')
}

export function setAuth(token) {
  _token = token
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem(LS_TOKEN, token)
    console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`)
    console.log('Current API headers after setting:', api.defaults.headers.common)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem(LS_TOKEN)
    console.log('Authorization header removed')
    console.log('Current API headers after removal:', api.defaults.headers.common)
  }
}

export function getAuthToken() {
  return _token
}

// Debug function to check localStorage
export function debugAuthState() {
  const storedToken = localStorage.getItem('jt_auth_token')
  console.log('=== AUTH DEBUG ===')
  console.log('Stored token in localStorage:', storedToken ? 'Present' : 'Missing')
  console.log('Current _token variable:', _token ? 'Present' : 'Missing')
  console.log('API headers:', api.defaults.headers.common)
  console.log('==================')
  return { storedToken, currentToken: _token, headers: api.defaults.headers.common }
}

// Function to clear invalid token
export function clearInvalidToken() {
  console.log('Clearing invalid token from localStorage')
  localStorage.removeItem('jt_auth_token')
  _token = null
  delete api.defaults.headers.common['Authorization']
}

// Add request interceptor to ensure Authorization header is always set
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    console.log('Request interceptor called for:', config.url)
    console.log('Token available:', token ? 'Yes' : 'No')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Request interceptor: Adding Authorization header')
      console.log('Final request headers:', config.headers)
    } else {
      console.log('Request interceptor: No token available')
    }
    return config
  },
  (error) => {
    console.log('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Authentication error detected, clearing token')
      clearInvalidToken()
    }
    return Promise.reject(error)
  }
)

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
