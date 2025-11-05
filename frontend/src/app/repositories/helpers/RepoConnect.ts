'use client'

import { ConnectedRepo, GitHubRepo } from '@/../Types/RepoTypes'
import { UseMutationResult } from '@tanstack/react-query'

export const getConnectedRepoId = (githubRepoId: number, connectedRepos: ConnectedRepo[]): string | null => {
    const repo = connectedRepos.find((repo) => repo.githubRepoId === githubRepoId.toString())
    return repo?.id || null
  }

export const handleConnect = async (
  repo: GitHubRepo,
  connectMutation: UseMutationResult<any, Error, GitHubRepo, unknown>
) => {
  try {
    await connectMutation.mutateAsync(repo)
  } catch (err) {
    console.error('Error connecting repository:', err)
  }
}


export const handleDisconnect = async (
  githubRepoId: number,
  connectedRepos: ConnectedRepo[],
  disconnectMutation: UseMutationResult<any, Error, string, unknown>
) => {
  const repoId = getConnectedRepoId(githubRepoId, connectedRepos)
  if (!repoId) return

  try {
    await disconnectMutation.mutateAsync(repoId)
  } catch (err) {
    console.error('Error disconnecting repository:', err)
  }
}