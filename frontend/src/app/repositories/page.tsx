'use client'

import ProtectedRoute from '@/app/Components/auth/ProtectedRoute'
import { LoadingSpinner } from '@/app/Components/images/LoadingSpinner'
import { useGithubRepos, useConnectedRepos, useConnectRepo, useDisconnectRepo } from '@/query/repositories'
import { handleConnect, handleDisconnect } from './helpers/RepoConnect'
import { ConnectedRepo, GitHubRepo } from '../../../Types/RepoTypes'

export default function RepositoriesPage() {
  return (
    <ProtectedRoute>
      <RepositoriesContent />
    </ProtectedRoute>
  )
}

  const isRepoConnected = (githubRepoId: number, connectedRepos: ConnectedRepo[]): boolean => {
    return connectedRepos.some((repo) => repo.githubRepoId === githubRepoId.toString())
  }

function RepositoriesContent() {
  const { data: githubRepos = [], isLoading: githubLoading, error: githubError } = useGithubRepos()
  const { data: connectedRepos = [], isLoading: connectedLoading, error: connectedError } = useConnectedRepos()
  const connectMutation = useConnectRepo()
  const disconnectMutation = useDisconnectRepo()

  if (githubLoading || connectedLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  } else if (githubError || connectedError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error loading repositories. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Repositories</h1>
          <p className="text-gray-600">
            Connect your GitHub repositories to start analyzing code and creating notes
          </p>
          <div className="mt-4 flex gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">GitHub Repositories</p>
              <p className="text-2xl font-bold text-blue-600">{githubRepos.length}</p>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">
                {connectedRepos.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Repositories</h2>
          </div>

          <div className="divide-y">
            {githubRepos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No repositories found in your GitHub account
              </div>
            ) : (
              githubRepos.map((repo: GitHubRepo) => {
                const connected = isRepoConnected(repo.id, connectedRepos)
                const isProcessing = connectMutation.isPending || disconnectMutation.isPending

                return (
                  <div
                    key={repo.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-blue-600 hover:underline"
                          >
                            {repo.full_name}
                          </a>
                          {repo.private && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Private
                            </span>
                          )}
                          {connected && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Connected
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-2">
                          {repo.description || 'No description'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {repo.language && (
                            <div className="flex items-center gap-1">
                              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                              <span>{repo.language}</span>
                            </div>
                          )}
                          <span>
                            {(repo.size / 1024).toFixed(1)} MB
                          </span>
                          <span>
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 w-32">
                        {connected ? (
                          <button
                            onClick={() => handleDisconnect(repo.id, connectedRepos, disconnectMutation)}
                            disabled={isProcessing}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isProcessing ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnect(repo, connectMutation)}
                            disabled={isProcessing}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isProcessing ? 'Connecting...' : 'Connect'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
