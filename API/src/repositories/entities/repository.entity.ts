export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  default_branch: string;
  language: string | null;
  size: number;
  clone_url: string;
  updated_at: string;
  pushed_at: string;
}

export interface Repository {
  id: string;
  user_id: string;
  github_repo_id: bigint;
  full_name: string;
  default_branch: string | null;
  language: string | null;
  size_kb: number | null;
  is_private: boolean;
  clone_url: string;
  webhook_url: string | null;
  github_metadata: any;
  last_analyzed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
