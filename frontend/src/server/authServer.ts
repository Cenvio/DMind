import axios from 'axios'
import { API_URL, axiosInstance } from './api'

export async function getCurrentUser() {
  const response = await axiosInstance.get('/auth/user')
  return response.data
}

export async function logout() {
  const response = await axiosInstance.post('/auth/logout')
  return response.data
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshed = await refreshToken()

      if (refreshed) {
        return axiosInstance(originalRequest)
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
        throw new Error('Session expired. Please log in again.')
      }
    }  
  }
)

async function refreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { withCredentials: true }
      )

      if (response.status === 200) {
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}