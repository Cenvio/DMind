const API_URL = process.env.NEXT_PUBLIC_API_URL

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean
}

class ApiClient {
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options

    const config: RequestInit = {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    }

    let response = await fetch(`${API_URL}${endpoint}`, config)

    if (response.status === 401 && requiresAuth) {
      const refreshed = await this.refreshToken()

      if (refreshed) {
        response = await fetch(`${API_URL}${endpoint}`, config)
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
        throw new Error('Session expired. Please log in again.')
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An error occurred' }))
      throw new Error(error.error || error.message || 'Request failed')
    }

    return response.json()
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (response.ok) {
          return true
        }
        return false
      } catch (error) {
        console.error('Token refresh failed:', error)
        return false
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

   async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiClient()
