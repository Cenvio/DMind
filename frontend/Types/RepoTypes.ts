export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
  html_url: string
  description: string | null
  default_branch: string
  language: string | null
  size: number
  clone_url: string
  updated_at: string
}

export interface ConnectedRepo {
  id: string
  githubRepoId: string
  fullName: string
  defaultBranch: string | null
  language: string | null
  sizeKb: number | null
  isPrivate: boolean
  cloneUrl: string
  webhookUrl: string | null
  lastAnalyzedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
