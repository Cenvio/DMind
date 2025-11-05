'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/Components/auth/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { axiosInstance } from '@/server/api'
import {LoadingSpinner} from '@/app/Components/images/LoadingSpinner'

interface ConnectedRepo {
  id: string
  githubRepoId: string
  fullName: string
  defaultBranch: string | null
  language: string | null
  sizeKb: number | null
  isPrivate: boolean
  lastAnalyzedAt: Date | null
  updatedAt: Date
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [repos, setRepos] = useState<ConnectedRepo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConnectedRepos()
  }, [])

  const fetchConnectedRepos = async () => {
    try {
      const response = await axiosInstance.get('/repositories')
      setRepos(response.data.repositories)
    } catch (err) {
      console.error('Error fetching repositories:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Connected Repositories</h3>
            <p className="text-3xl font-bold text-blue-600">{repos.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Analyzed</h3>
            <p className="text-3xl font-bold text-green-600">
              {repos.filter(r => r.lastAnalyzedAt).length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-orange-600">
              {repos.filter(r => !r.lastAnalyzedAt).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="ml-2">{user?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="ml-2">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">GitHub:</span>
                <span className="ml-2">@{user?.githubUsername}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Connected Repositories</h2>
              <button
                onClick={() => router.push('/repositories')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Repositories
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : repos.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 mb-4">No repositories connected yet</p>
              <button
                onClick={() => router.push('/repositories')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect Your First Repository
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {repos.slice(0, 5).map((repo) => (
                <div key={repo.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{repo.fullName}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            {repo.language}
                          </span>
                        )}
                        {repo.sizeKb && (
                          <span>{(repo.sizeKb / 1024).toFixed(1)} MB</span>
                        )}
                        {repo.lastAnalyzedAt ? (
                          <span className="text-green-600">✓ Analyzed</span>
                        ) : (
                          <span className="text-orange-600">⏳ Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {repos.length > 5 && (
                <div className="p-4 text-center">
                  <button
                    onClick={() => router.push('/repositories')}
                    className="text-blue-600 hover:underline"
                  >
                    View all {repos.length} repositories →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
