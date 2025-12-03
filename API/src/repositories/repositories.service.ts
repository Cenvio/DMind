import {Injectable, NotFoundException, BadRequestException, UnauthorizedException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ConnectRepositoryDto } from './dto/repository.dto';
import { GitHubRepository } from './entities/repository.entity';

@Injectable()
export class RepositoriesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async getGitHubRepositories(userId: string): Promise<GitHubRepository[]> {
    const user = await this.usersService.findById(userId);

    if (!user || !user.github_access_token) {
      throw new UnauthorizedException('GitHub access token not found');
    }

    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          Authorization: `Bearer ${user.github_access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new UnauthorizedException('GitHub token has expired or is invalid. Please reconnect your GitHub account.');
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const repos: GitHubRepository[] = await response.json();
      return repos;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch repositories from GitHub: ${error.message}`,
      );
    }
  }

  async getConnectedRepositories(userId: string) {
    const repositories = await this.prisma.repositories.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
    });

    return repositories.map((repo) => ({
      id: repo.id,
      githubRepoId: repo.github_repo_id.toString(),
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      language: repo.language,
      sizeKb: repo.size_kb,
      isPrivate: repo.is_private,
      cloneUrl: repo.clone_url,
      webhookUrl: repo.webhook_url,
      lastAnalyzedAt: repo.last_analyzed_at,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    }));
  }

  async connectRepository(userId: string, dto: ConnectRepositoryDto) {
    const existing = await this.prisma.repositories.findFirst({
      where: {
        user_id: userId,
        github_repo_id: BigInt(dto.githubRepoId),
      },
    });

    if (existing) {
      throw new BadRequestException('Repository already connected');
    }

    const user = await this.usersService.findById(userId);
    if (user?.github_access_token) {
      try {
        const response = await fetch(`https://api.github.com/repositories/${dto.githubRepoId}`, {
          headers: {
            Authorization: `Bearer ${user.github_access_token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (response.status === 404 || response.status === 403) {
          throw new UnauthorizedException('You do not have access to this repository');
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
      }
    }

    const repository = await this.prisma.repositories.create({
      data: {
        user_id: userId,
        github_repo_id: BigInt(dto.githubRepoId),
        full_name: dto.fullName,
        default_branch: dto.defaultBranch,
        language: dto.language,
        size_kb: dto.sizeKb,
        is_private: dto.isPrivate,
        clone_url: dto.cloneUrl,
        github_metadata: dto.githubMetadata || {},
      },
    });

    return {
      id: repository.id,
      githubRepoId: repository.github_repo_id.toString(),
      fullName: repository.full_name,
      defaultBranch: repository.default_branch,
      language: repository.language,
      sizeKb: repository.size_kb,
      isPrivate: repository.is_private,
      cloneUrl: repository.clone_url,
      webhookUrl: repository.webhook_url,
      lastAnalyzedAt: repository.last_analyzed_at,
      createdAt: repository.created_at,
      updatedAt: repository.updated_at,
    };
  }

  async disconnectRepository(userId: string, repositoryId: string) {
    const repository = await this.prisma.repositories.findUnique({
      where: { id: repositoryId },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    if (repository.user_id !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to disconnect this repository',
      );
    }

    await this.prisma.repositories.delete({
      where: { id: repositoryId },
    });

    return { success: true, message: 'Repository disconnected successfully' };
  }

  async getRepositoryById(userId: string, repositoryId: string) {
    const repository = await this.prisma.repositories.findFirst({
      where: {
        id: repositoryId,
        user_id: userId,
      },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    return {
      id: repository.id,
      githubRepoId: repository.github_repo_id.toString(),
      fullName: repository.full_name,
      defaultBranch: repository.default_branch,
      language: repository.language,
      sizeKb: repository.size_kb,
      isPrivate: repository.is_private,
      cloneUrl: repository.clone_url,
      webhookUrl: repository.webhook_url,
      lastAnalyzedAt: repository.last_analyzed_at,
      createdAt: repository.created_at,
      updatedAt: repository.updated_at,
    };
  }
}
