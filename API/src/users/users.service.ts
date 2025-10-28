import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GitHubUser } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findByGithubUsername(username: string) {
    return this.prisma.users.findUnique({
      where: { github_username: username },
    });
  }

  async findOrCreateUser(githubData: GitHubUser, githubToken: string) {
    if (!githubData.email) {
      throw new Error('GitHub email is required but was not provided');
    }

    let user = await this.prisma.users.findFirst({
      where: {
        OR: [
          { github_username: githubData.login },
          { email: githubData.email },
        ],
      },
    });

    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 8);

    if (user) {
      user = await this.prisma.users.update({
        where: { id: user.id },
        data: {
          github_access_token: githubToken,
          github_token_expires_at: tokenExpiry,
          name: githubData.name || user.name,
          avatar_url: githubData.avatar_url || user.avatar_url,
          updated_at: new Date(),
        },
      });
    } else {
      user = await this.prisma.users.create({
        data: {
          email: githubData.email,
          github_username: githubData.login,
          github_access_token: githubToken,
          github_token_expires_at: tokenExpiry,
          name: githubData.name,
          avatar_url: githubData.avatar_url,
        },
      });
    }

    return user;
  }
}
