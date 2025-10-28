export class User {
  id: string;
  email: string;
  github_username: string;
  notion_access_token?: string;
  github_access_token?: string;
  github_token_expires_at?: Date;
  name?: string;
  avatar_url?: string;
  settings?: any;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}
