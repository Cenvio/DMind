'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGithubRepos, getConnectedRepos, connectRepos, disconnectRepository } from '@/server/Repositories'
import { GitHubRepo } from '@/../Types/RepoTypes'

export function useGithubRepos() {
  return useQuery({
    queryKey: ['github-repos'],
    queryFn: getGithubRepos,
  })
}

export function useConnectedRepos() {
  return useQuery({
    queryKey: ['connected-repos'],
    queryFn: getConnectedRepos,
  })
}

export function useConnectRepo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (repo: GitHubRepo) => connectRepos(repo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-repos'] })
      queryClient.invalidateQueries({ queryKey: ['github-repos'] })
    },
  })
}

export function useDisconnectRepo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (repoId: string) => disconnectRepository(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-repos'] })
      queryClient.invalidateQueries({ queryKey: ['github-repos'] })
    },
  })
}
