import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { GitHubUser } from '../users/entities/user.entity';
import { JwtPayloadDto, TokenResponseDto } from './dto/auth.dto';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getGitHubAccessToken(code: string): Promise<string> {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.configService.get('github.clientId'),
          client_secret: this.configService.get('github.clientSecret'),
          code: code,
        }),
      },
    );

    const data: GitHubTokenResponse = await response.json();

    if (!data.access_token) {
      throw new Error('Failed to get access token from GitHub');
    }

    return data.access_token;
  }

  async getGitHubUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub user: ${response.statusText}`);
    }

    const userData: GitHubUser = await response.json();

    if (!userData.email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((email: any) => email.primary);
        userData.email = primaryEmail?.email || null;
      }
    }

    return userData;
  }

  generateTokens(payload: JwtPayloadDto): TokenResponseDto {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.accessTokenExpiry'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshTokenExpiry'),
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayloadDto | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): JwtPayloadDto | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('jwt.refreshSecret'),
      });
    } catch {
      return null;
    }
  }

  async handleGitHubCallback(code: string) {
    const githubAccessToken = await this.getGitHubAccessToken(code);
    const githubUser = await this.getGitHubUser(githubAccessToken);

    const user = await this.usersService.findOrCreateUser(
      githubUser,
      githubAccessToken,
    );

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      githubUsername: user.github_username,
    });

    return { tokens, user };
  }

  async refreshTokens(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = this.generateTokens({
      userId: payload.userId,
      email: payload.email,
      githubUsername: payload.githubUsername,
    });

    return tokens;
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      githubUsername: user.github_username,
      avatarUrl: user.avatar_url,
    };
  }
}
