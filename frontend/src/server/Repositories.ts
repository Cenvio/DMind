import { axiosInstance } from './api'
import { GitHubRepo } from '@/../Types/RepoTypes'

export async function getGithubRepos() {
  const response = await axiosInstance.get('/repositories/github')
  return response.data.repositories
}

export async function getConnectedRepos() {
  const response = await axiosInstance.get('/repositories')
  return response.data.repositories
}
export async function connectRepos(repo: GitHubRepo) {
  const response = await axiosInstance.post('/repositories/connect', {
        githubRepoId: repo.id,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch,
        language: repo.language,
        sizeKb: repo.size,
        isPrivate: repo.private,
        cloneUrl: repo.clone_url,
        githubMetadata: {
          description: repo.description,
          html_url: repo.html_url,
          owner: repo.owner.login,
          updated_at: repo.updated_at,
        },
      })
  return response.data.repository
}

export async function disconnectRepository(repoId: string) {
  const response = await axiosInstance.delete(`/repositories/${repoId}/disconnect`)
  return response.data
}