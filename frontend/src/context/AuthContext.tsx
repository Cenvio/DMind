'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface User {
  id: string
  email: string
  name: string
  githubUsername: string
  avatarUrl: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to refresh auth:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [API_URL])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
