'use client'

import ProtectedRoute from '@/app/Components/auth/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>GitHub Username:</strong> @{user?.githubUsername}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
