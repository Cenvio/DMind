"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallback() {
  const router = useRouter()
  const { refreshAuth } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await refreshAuth()
        router.push('/dashboard')
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/')
      }
    }

    handleCallback()
  }, [refreshAuth])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing login...</p>
      </div>
    </div>
  )
}
